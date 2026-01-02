import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "first_workout",
        "10_workouts",
        "50_workouts",
        "100_workouts",
        "500_workouts",
        "first_pr",
        "bench_100kg",
        "squat_150kg",
        "deadlift_200kg",
        "7_day_streak",
        "30_day_streak",
        "100_day_streak",
        "10k_calories",
        "50k_calories",
        "100k_calories",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    icon: String, // emoji or icon name
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model("Achievement", achievementSchema);
