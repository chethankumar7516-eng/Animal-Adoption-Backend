import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import { sendEmail } from "../config/mail.js";

// ==========================
// REGISTER USER
// ==========================
export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone || "",
            address: address || ""
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error("REGISTER USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};


// ==========================
// LOGIN USER
// ==========================
export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            await se
            return res.status(400).json({

                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: "user"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
         await sendEmail(user.email, "Login" , "Login detected your account")
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error("LOGIN USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};


// ==========================
// GET USER PROFILE
// ==========================
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};