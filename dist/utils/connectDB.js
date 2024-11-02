import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        const dbUri = process.env.DB_URI;
        // Check if DB_URI is defined
        if (!dbUri) {
            throw new Error("DB_URI is not defined in environment variables.");
        }
        // Attempt to connect to MongoDB
        await mongoose.connect(dbUri);
        console.log("MongoDB connected Successfully!");
        // Optionally enable mongoose debugging in development
        // if (process.env.NODE_ENV === 'development') {
        //     mongoose.set('debug', true);  // Logs MongoDB queries
        // }
    }
    catch (error) {
        console.error("MongoDB connection error: ", error);
        process.exit(1);
    }
};
