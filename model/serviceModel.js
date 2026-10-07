import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;