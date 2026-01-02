import mongoose from "mongoose";

const WeighInSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    weightKg: { type: Number, required: true },
  },
  { timestamps: true }
);

export const WeighIn = mongoose.model("WeighIn", WeighInSchema);
