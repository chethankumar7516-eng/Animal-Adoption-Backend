import Service from "../model/serviceModel.js";
import Pet from "../model/petModel.js";
import User from "../model/userModel.js";
import Provider from "../model/providerModel.js";


// ======================================================
// USER SEND ADOPTION REQUEST
// ======================================================

export const sendAdoptionRequest = async (req, res) => {
    try {
        const { petId } = req.body;

        // Check pet ID
        if (!petId) {
            return res.status(400).json({
                success: false,
                message: "Pet ID is required"
            });
        }

        // Only user
        if (req.user?.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only users can request adoption"
            });
        }

        const userId = req.user.userId;

        // Check user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find pet
        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found"
            });
        }

        // Get provider from pet
        const providerId = pet.provider;

        if (!providerId) {
            return res.status(404).json({
                success: false,
                message:
                    "Provider not found for this pet"
            });
        }

        // Check provider
        const provider =
            await Provider.findById(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        // Check existing request
        const existingRequest =
            await Service.findOne({
                petId: petId,
                userId: userId
            });

 

        // Create request
        const request = await Service.create({
            petId: petId,
            userId: userId,
            providerId: providerId,
            status: "pending"
        });

        // Populate request
        const populatedRequest =
            await Service.findById(request._id)
                .populate(
                    "petId",
                    "name type breed age gender image status provider"
                )
                .populate(
                    "userId",
                    "name email phone address"
                )
                .populate(
                    "providerId",
                    "name email phone"
                );

        return res.status(201).json({
            success: true,
            message:
                "Adoption request sent successfully",
            data: populatedRequest
        });

    } catch (error) {
        console.error(
            "Send adoption request error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ======================================================
// USER GET REQUESTS
// ======================================================

export const getUserRequests = async (req, res) => {
    try {
        if (req.user?.role !== "user") {
            return res.status(403).json({
                success: false,
                message:
                    "Only users can access requests"
            });
        }

        const userId = req.user.userId;

        const requests = await Service.find({
            userId: userId
        })
            .populate(
                "petId",
                "name type breed age gender image status provider"
            )
            .populate(
                "userId",
                "name email phone"
            )
            .sort({
                createdAt: -1
            });
             
        return res.status(200).json({
            success: true,
            count: requests.length,
            
            requests
        });

    } catch (error) {
        console.error(
            "Get user requests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ======================================================
// PROVIDER GET REQUESTS
// ======================================================

export const getProviderRequests = async (
    req,
    res
) => {
    try {
        // Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });
        }

        // Only provider
        if (req.user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message:
                    "Only providers can access requests"
            });
        }

        // Get provider ID from JWT
        const providerId = req.user.providerId;

        if (!providerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Provider ID missing from token"
            });
        }

        console.log(
            "Provider requesting adoption requests:",
            providerId
        );

        // Get requests belonging to this provider
        const requests = await Service.find({
            providerId: providerId
        })
            .populate(
                "userId",
                "name email phone address"
            )
            .populate(
                "petId",
                "name type breed age gender image status"
            )
            .populate(
                "providerId",
                "name email phone"
            )
            .sort({
                createdAt: -1
            });

        console.log(
            "Provider requests found:",
            requests.length
        );

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error(
            "Get provider requests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error"
        });
    }
};


// ======================================================
// PROVIDER ACCEPT / REJECT REQUEST
// ======================================================

export const updateRequestStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });
        }

        // Only provider
        if (req.user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message:
                    "Only providers can update requests"
            });
        }

        const providerId =
            req.user.providerId;

        if (!providerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Provider ID missing from token"
            });
        }

        // Validate status
        if (
            !["accepted", "rejected"].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be accepted or rejected"
            });
        }

        // Find request
        const request =
            await Service.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        // Make sure provider owns request
        if (
            !request.providerId ||
            request.providerId.toString() !==
                providerId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot update this request"
            });
        }

        // Only pending request
        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "This request has already been processed"
            });
        }

        // Update status
        request.status = status;

        await request.save();

        // Populate updated request
        const updatedRequest =
            await Service.findById(
                request._id
            )  .populate(
                    "petId",
                    "name type breed age gender image status"
                )
                .populate(
                    "userId",
                    "name email phone address"
                )
              
                .populate(
                    "providerId",
                    "name email phone"
                );

        return res.status(200).json({
            success: true,
            message:
                `Request ${status} successfully`,
            data: updatedRequest
        });

    } catch (error) {
        console.error(
            "Update request status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error"
        });
    }
};