import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["fat_loss", "muscle_gain", "strength", "endurance"],
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    targetDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
