import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://chethankumar7516_db_user:OJwtP9U44Y70hEIy@cluster0.6pelshk.mongodb.net/?appName=Cluster0/pet");

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;