import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    name: String,
    calories: Number,
    protein: Number, // grams
    carbs: Number,   // grams
    fat: Number,     // grams
    notes: String,
  },
  { timestamps: true }
);

export const Meal = mongoose.model("Meal", mealSchema);
