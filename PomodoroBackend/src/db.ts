import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connection succesfull!");
  } catch (error) {
    console.error("Connection Failed", error);
    process.exit(1);
  }
};
