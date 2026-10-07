import express from "express";

import {
    sendMessage,
    getProviderMessages,
    getUserMessages
} from "../controller/messageController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// Send message
router.post(
    "/send",
    auth,
    sendMessage
);

// Provider messages
router.get(
    "/provider",
    auth,
    getProviderMessages
);

// User messages
router.get(
    "/user",
    auth,
    getUserMessages
);

export default router;