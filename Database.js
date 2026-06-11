import mongoose from "mongoose";

export const connectDB = async () => {
    const db = process.env.MONGO_URL;
    if (!db) {
        console.error("Missing MONGO_URL environment variable. Create backend/config/config.env with MONGO_URL and PORT.");
        process.exit(1);
    }

    try {
        const { connection } = await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected to ${connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};
