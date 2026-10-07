import express from "express";

import {
    registerUser,
    loginUser,
    getUserProfile
} from "../controller/userController.js";

import auth from "../middleware/auth.js";
import { validateUserRegister } from "../middleware/validator.js";
import { rateLimitation } from "../middleware/rateLimit.js";

const router = express.Router();

// ==========================
// REGISTER
// ==========================
router.post(
    "/register",
    validateUserRegister,
    registerUser
);

// ==========================
// LOGIN
// ==========================
router.post(
    "/login",
    rateLimitation,
    loginUser
);

// ==========================
// USER PROFILE
// ==========================
router.get(
    "/profile",
    auth,
    getUserProfile
);

export default router;