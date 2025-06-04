import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI must be defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "clinic", // Atlas’ta “clinic” DB’sini kullanıyoruz
    });
    console.log("✅ MongoDB connected successfully to 'clinic' DB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
