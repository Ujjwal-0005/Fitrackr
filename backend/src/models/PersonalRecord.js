import mongoose from "mongoose";

const PersonalRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["strength", "endurance"], required: true },
    name: { type: String, required: true }, // e.g., "Bench Press 1RM" / "5K Run"
    value: { type: Number, required: true }, // e.g., 100 (kg) or 25 (mins)
    unit: { type: String, required: true },  // "kg","reps","mins","km"
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PersonalRecord = mongoose.model("PersonalRecord", PersonalRecordSchema);
