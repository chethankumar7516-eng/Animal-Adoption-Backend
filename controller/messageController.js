import Message from "../model/messageModel.js";
import Pet from "../model/petModel.js";
import User from "../model/userModel.js";
import Provider from "../model/providerModel.js";

// ======================================================
// SEND MESSAGE (USER <-> PROVIDER)
// ======================================================
export const sendMessage = async (req, res) => {
    try {
        const { receiver, receiverModel, pet, message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
            });
        }

        let senderId, senderModel, targetReceiverId, targetReceiverModel;

        // ------------------------------------------------------
        // CASE 1: PROVIDER SENDING A MESSAGE TO A USER
        // ------------------------------------------------------
        if (req.user.role === "provider") {
            senderId = req.user.providerId || req.user.userId;
            senderModel = "Provider";

            if (!receiver) {
                return res.status(400).json({
                    success: false,
                    message: "User recipient is required for provider replies",
                });
            }

            targetReceiverId = receiver;
            targetReceiverModel = receiverModel || "User";

            // Verify User exists
            const user = await User.findById(targetReceiverId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Recipient user not found",
                });
            }
        } 
        // ------------------------------------------------------
        // CASE 2: USER SENDING A MESSAGE TO A PROVIDER
        // ------------------------------------------------------
        else if (req.user.role === "user") {
            senderId = req.user.userId;
            senderModel = "User";

            if (!pet) {
                return res.status(400).json({
                    success: false,
                    message: "Pet ID is required when initiating a message",
                });
            }

            const existingPet = await Pet.findById(pet);
            if (!existingPet) {
                return res.status(404).json({
                    success: false,
                    message: "Pet not found",
                });
            }

            if (!existingPet.provider) {
                return res.status(404).json({
                    success: false,
                    message: "Provider not found for this pet",
                });
            }

            targetReceiverId = existingPet.provider;
            targetReceiverModel = "Provider";
        } else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized role",
            });
        }

        // ------------------------------------------------------
        // CREATE AND POPULATE MESSAGE
        // ------------------------------------------------------
        const newMessage = await Message.create({
            sender: senderId,
            senderModel,
            receiver: targetReceiverId,
            receiverModel: targetReceiverModel,
            pet: pet || null,
            message: message.trim(),
        });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name email phone")
            .populate("receiver", "name email phone")
            .populate("pet", "name type breed age gender image status provider");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage,
        });
    } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ======================================================
// GET USER MESSAGES
// ======================================================
export const getUserMessages = async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only users can access this",
            });
        }

        const userId = req.user.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId, senderModel: "User" },
                { receiver: userId, receiverModel: "User" },
            ],
        })
            .populate("sender", "name email phone")
            .populate("receiver", "name email phone")
            .populate("pet", "name type breed age gender image status provider")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });
    } catch (error) {
        console.error("Get user messages error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ======================================================
// GET PROVIDER MESSAGES
// ======================================================
export const getProviderMessages = async (req, res) => {
    try {
        if (req.user.role !== "provider") {
            return res.status(403).json({
                success: false,
                message: "Only providers can access this",
            });
        }

        const providerId = req.user.providerId || req.user.userId;

        const messages = await Message.find({
            $or: [
                { sender: providerId, senderModel: "Provider" },
                { receiver: providerId, receiverModel: "Provider" },
            ],
        })
            .populate("sender", "name email phone")
            .populate("receiver", "name email phone")
            .populate("pet", "name type breed age gender image status provider")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });
    } catch (error) {
        console.error("Get provider messages error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};