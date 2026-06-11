import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/UserSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "./config/config.env") });

const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined in backend/config/config.env");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const result = await User.deleteMany({});
  console.log(`Deleted ${result.deletedCount} user(s) from the database.`);
  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to clear users:", err);
    process.exit(1);
  });
