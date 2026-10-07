import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "senderModel"
        },

        senderModel: {
            type: String,
            required: true,
            enum: ["User", "Provider"]
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "receiverModel"
        },

        receiverModel: {
            type: String,
            required: true,
            enum: ["User", "Provider"]
        },

        pet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;