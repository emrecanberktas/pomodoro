import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
