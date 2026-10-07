import Pet from "../model/petModel.js";
import { client } from "../config/redis.js";


// ======================================================
// ADD PET
// PROVIDER ONLY
// ======================================================
export const addPet = async (req, res) => {
    try {
        
      
        const image = req.file?.filename;
        const { name, type, breed, age, gender, description } = req.body;

        console.log(req.user);

        const storePet = await Pet.create({
            name,
            type,
            breed,
            age: Number(age),
            gender,
            description,
            image,
            provider: req.user?.providerId
        });

        if (!storePet) {
            return res.json({ success: false, message: "Pet not created" });
        }

        console.log(storePet);


        res.json({ success: true, message: "Pet Uploaded", data: storePet });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ======================================================
// GET ALL PETS
// PUBLIC / USER
// ======================================================
export const petlength= async (req, res) =>{
    try {
    const count = await Pet.countDocuments();
     // Fast async DB count query
    res.json({ data: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const getAllPets = async (req, res) => {
    try {
        // 1. Pagination Params
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 6, 1);
        const skip = (page - 1) * limit;

        // 2. Dynamic Redis Key (includes query parameters)
        const redisKey = `pets:page:${page}:limit:${limit}`;

        // 3. Check Redis Cache
        const redisPets = await client.get(redisKey);
        if (redisPets) {
            // Return identical JSON response structure on cache hit
            return res.status(200).json(JSON.parse(redisPets));
        }

        // 4. Query Database
        const filter = {
            status: { $ne: "adopted" }
        };

        const totalPets = await Pet.countDocuments(filter);

        const pets = await Pet.find(filter)
            .populate("provider", "name email phone address")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalPets / limit);

        // 5. Construct Unified Response Payload
        const responseData = {
            success: true,
            count: pets.length,
            totalPets,
            currentPage: page,
            totalPages,
            limit,
            pets
        };

        // 6. Store Response Payload in Redis (TTL: 10 seconds)
        await client.set(redisKey, JSON.stringify(responseData), {
            EX: 10
        });

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Get all pets error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error while getting pets"
        });
    }
};

// ======================================================
// GET PET BY ID
// PUBLIC / USER
// ======================================================

export const getPetById = async (req, res) => {
    try {

        const { id } = req.params;


        const pet =
            await Pet.findById(id)
                .populate(
                    "provider",
                    "name email phone address"
                );


        if (!pet) {
            return res.status(404).json({
                success: false,
                message:
                    "Pet not found"
            });
        }


        return res.status(200).json({
            success: true,
            pet
        });

    } catch (error) {

        console.error(
            "Get pet error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error while getting pet"
        });
    }
};


// ======================================================
// GET PROVIDER'S PETS
// PROVIDER ONLY
// ======================================================

export const getProviderPets = async (
    req,
    res
) => {
    try {

        // ==============================================
        // CHECK PROVIDER
        // ==============================================
        
        if (
            !req.user ||
            req.user.role !== "provider" ||
            !req.user.providerId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Provider authentication is required"
            });
        }


        const pets =
            await Pet.find({
                provider:
                    req.user.providerId
            })
                .populate(
                    "provider",
                    "name email phone address"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({
            success: true,
            count: pets.length,
            pets
        });

    } catch (error) {

        console.error(
            "Get provider pets error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error while getting provider pets"
        });
    }
};


// ======================================================
// UPDATE PET
// PROVIDER ONLY
// ======================================================

export const updatePet = async (req, res) => {
    try {
        const { id } = req.params;

        // Check provider authentication
        if (!req.user || req.user.role !== "provider" || !req.user.providerId) {
            return res.status(403).json({
                success: false,
                message: "Provider authentication is required"
            });
        }

        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found"
            });
        }

        // Verify provider ownership
        if (!pet.provider || pet.provider.toString() !== req.user.providerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this pet"
            });
        }

        // Handle uploaded file (via multer) or direct image string
        const image = req.file ? req.file.filename : req.body.image;
        const { name, type, breed, age, gender, description, status } = req.body;

        // Update fields if provided
        if (name !== undefined) pet.name = name.trim();
        if (type !== undefined) pet.type = type.trim();
        if (breed !== undefined) pet.breed = breed.trim();
        if (age !== undefined) pet.age = Number(age);
        if (gender !== undefined) pet.gender = gender;
        if (description !== undefined) pet.description = description.trim();
        if (image !== undefined) pet.image = typeof image === "string" ? image.trim() : image;
        if (status !== undefined) pet.status = status;

        const updatedPet = await pet.save();

        // Clear Redis cache
        try {
            await client.del("Pet");
        } catch (redisError) {
            console.error("Redis clear error:", redisError);
        }

        return res.status(200).json({
            success: true,
            message: "Pet Updated Successfully",
            pet: updatedPet
        });
    } catch (error) {
        console.error("Update pet server error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error while updating pet"
        });
    }
};


// ======================================================
// DELETE PET
// PROVIDER ONLY
// ======================================================

export const deletePet = async (req, res) => {
    try {

        const { id } = req.params;


        // ==============================================
        // CHECK PROVIDER
        // ==============================================

        if (
            !req.user ||
            req.user.role !== "provider" ||
            !req.user.providerId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Provider authentication is required"
            });
        }


        // ==============================================
        // FIND PET
        // ==============================================

        const pet =
            await Pet.findById(id);


        if (!pet) {
            return res.status(404).json({
                success: false,
                message:
                    "Pet not found"
            });
        }


        // ==============================================
        // CHECK OWNER
        // ==============================================

        if (
            !pet.provider ||
            pet.provider.toString() !==
                req.user.providerId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this pet"
            });
        }


        await Pet.findByIdAndDelete(id);


        // ==============================================
        // CLEAR CACHE
        // ==============================================

        try {
            await client.del("Pet");
        } catch (redisError) {
            console.error(
                "Redis clear error:",
                redisError
            );
        }


        return res.status(200).json({
            success: true,
            message:
                "Pet deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete pet error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error while deleting pet"
        });
    }
};


export const GetByType=async(req,res)=>{
    try{
        const type=req.params.type
        const find=await petModel.find({type})
        if(!type){
            res.json({success:false,message:"Type Not found"})
        }
        if(!find ){
           res.json({success:false,message:" Not found"}) 
        }
        res.json({success:true,message:"BY TYPE",data:find})
    }
    catch(error){
         res.json({success:false,message:error.message})
    }

}


export const StatusUpdate = async (req, res) => {
    try {
        const id = req.params._id;

        // Find the pet by ID and update its status field to "Adopted"
        const updatedPet = await petModel.findByIdAndUpdate(
            id,
            { status: "Adopted" },
            { new: true, runValidators: true } // returns the updated document & validates inputs
        );

        if (!updatedPet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pet status updated to Adopted successfully.",
            pet: updatedPet,
        });
    } catch (error) {
        console.error("Error updating pet status:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating pet status.",
            error: error.message,
        });
    }
};