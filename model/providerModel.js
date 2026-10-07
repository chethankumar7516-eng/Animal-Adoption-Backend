import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Provider = mongoose.model(
    "Provider",
    providerSchema
);

export default Provider;