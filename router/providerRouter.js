import express from "express";

import {
    registerProvider,
    loginProvider,
    getProviderProfile,
    getpetByProvider
} from "../controller/providerController.js";

import auth from "../middleware/auth.js";

const router = express.Router();


// ==========================================
// PROVIDER REGISTER
// ==========================================

router.post(
    "/register",
    registerProvider
);


// ==========================================
// PROVIDER LOGIN
// ==========================================

router.post(
    "/login",
    loginProvider
);
 router.get("/getpetbyprovider/:id",getpetByProvider)

// ==========================================
// PROVIDER PROFILE
// ==========================================

router.get(
    "/profile",
    auth,
    getProviderProfile
);


export default router;