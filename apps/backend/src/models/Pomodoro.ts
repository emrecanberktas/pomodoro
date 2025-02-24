import mongoose, { Schema } from "mongoose";

const pomodoroSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", require: true },
  workTime: { type: Number, default: 25 * 60 },
  breakTime: { type: Number, default: 5 * 60 },
});

export const Pomodoro = mongoose.model("Pomodoro", pomodoroSchema);
