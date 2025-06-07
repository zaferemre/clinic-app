import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in environment");
  }
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "company",
  });
  console.log("✅ MongoDB connected");
};
