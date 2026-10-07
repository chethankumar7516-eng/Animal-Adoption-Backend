import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import providerRouter from "./router/providerRouter.js";
import userRouter from "./router/userRouter.js";
import petRouter from "./router/petRouter.js";
import messageRouter from "./router/messageRouter.js";
import serviceRouter from "./router/serviceRouter.js";

import connectDB from "./config/database.js";
import { redisConnect } from "./config/redis.js";

dotenv.config();

const app = express();


// ==========================
// MIDDLEWARE
// ==========================

app.use(cors());
app.use(express.json());


// ==========================
// DATABASE
// ==========================

connectDB();


// ==========================
// REDIS
// ==========================

redisConnect();


// ==========================
// ROUTES
// ==========================

app.use("/api/users", userRouter);

app.use("/api/providers", providerRouter);

app.use("/api/pets", petRouter);

app.use("/api/messages", messageRouter);

app.use("/api/service", serviceRouter);


// ==========================
// TEST
// ==========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Pet Adoption System API is running"
    });
});


// ==========================
// SERVER
// ==========================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});