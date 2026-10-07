import express from "express";

import {
    sendAdoptionRequest,
    getUserRequests,
    getProviderRequests,
    updateRequestStatus
} from "../controller/serviceController.js";

import auth from "../middleware/auth.js";

const router = express.Router();


// ======================================================
// USER SEND ADOPTION REQUEST
// ======================================================

router.post(
    "/sendrequest",
    auth,
    sendAdoptionRequest
);


// ======================================================
// USER GET REQUESTS
// ======================================================

router.get(
    "/user-requests",
    auth,
    getUserRequests
);


// ======================================================
// PROVIDER GET REQUESTS
// ======================================================

router.get(
    "/provider-requests",
    auth,
    getProviderRequests
);


// ======================================================
// PROVIDER ACCEPT / REJECT
// ======================================================

router.put(
    "/request/:id/status",
    auth,
    updateRequestStatus
);


export default router;