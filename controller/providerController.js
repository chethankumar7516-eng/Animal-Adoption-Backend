import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Provider from "../model/providerModel.js";
import petModel from "../model/petModel.js"
// ==========================================
// PROVIDER REGISTER
// ==========================================
export const registerProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body;

        // Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check existing provider
        const existingProvider = await Provider.findOne({ email });

        if (existingProvider) {
            return res.status(409).json({
                success: false,
                message: "Provider already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create provider
        const provider = await Provider.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            address: address || ""
        });

        return res.status(201).json({
            success: true,
            message: "Provider registered successfully",
            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                address: provider.address
            }
        });

    } catch (error) {
        console.error("Provider register error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// ==========================================
// PROVIDER LOGIN
// ==========================================
export const loginProvider = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

       
        // Find provider
        const provider =
            await Provider.findOne({
                email
            });

        if (!provider) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                provider.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is missing"
            );

            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                providerId: provider._id.toString(),
                role: "provider"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "Provider login successful",

            token,

            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                address: provider.address
            }
        });

    } catch (error) {
        console.error(
            "Provider login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// PROVIDER PROFILE
// ==========================================
export const getProviderProfile = async (
    req,
    res
) => {
    try {
        if (!req.user?.providerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Provider authentication required"
            });
        }

        const provider =
            await Provider.findById(
                req.user.providerId
            ).select("-password");

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        return res.status(200).json({
            success: true,
            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                address: provider.address
            }
        });

    } catch (error) {
        console.error(
            "Provider profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



export const getpetByProvider = async (req, res) => {
    try {
        const providerId = req.params.providerId || req.params.id || req.user?.providerId;

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: "Provider ID is required"
            });
        }

        const pets = await  petModel.find({ provider: providerId })
            .populate("provider", "name email phone address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: pets.length,
            pets
        });

    } catch (error) {
        console.error("Get provider pets error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error while getting provider pets"
        });
    }
};