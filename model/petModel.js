import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true
        },

        breed: {
            type: String,
            required: true
        },

        age: {
            type: Number,
            required: true
        },

        gender: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            default: "Available"
        },

        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Pet = mongoose.model("Pet", petSchema);

export default Pet;