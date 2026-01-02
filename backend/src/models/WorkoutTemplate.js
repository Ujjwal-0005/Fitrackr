import mongoose from "mongoose";

const templateExerciseSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
  name: String,
  sets: Number,
  reps: String, // e.g., "8-12" or "10"
  restSeconds: Number,
  notes: String,
});

const workoutTemplateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    exercises: [templateExerciseSchema],
    category: {
      type: String,
      enum: ["strength", "cardio", "hiit", "fullbody", "upperbody", "lowerbody", "custom"],
      default: "custom",
    },
    isPublic: { type: Boolean, default: false },
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WorkoutTemplate = mongoose.model("WorkoutTemplate", workoutTemplateSchema);
