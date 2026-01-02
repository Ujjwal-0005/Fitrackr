import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    exerciseId: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true 
    },
    name: { type: String, required: true },
    muscleGroup: {
      type: [String],
      required: true,
      enum: [
        "chest", "back", "shoulders", "biceps", "triceps", 
        "forearms", "quads", "hamstrings", "glutes", "calves", 
        "core", "abs", "lats", "traps", "cardio", "full_body"
      ]
    },
    muscles: {
      primary: [String],
      secondary: [String],
    },
    equipment: {
      type: [String],
      required: true,
      default: ["bodyweight"]
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "core", "flexibility", "power"],
      default: "strength"
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructions: [String],
    gifUrl: String,
    tags: [String],
    met: { type: Number, default: 6 }, // for calorie calculations
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", exerciseSchema);
