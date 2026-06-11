import mongoose from 'mongoose';
export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit process with failure to prevent the app from running in a broken state
        process.exit(1);
    }
};