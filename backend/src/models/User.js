import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["fat_loss", "muscle_gain", "endurance", "strength"],
  },
  target: String,
  startDate: Date,
  targetDate: Date,
  progress: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const planSchema = new mongoose.Schema({
  title: String,
  generatedAt: { type: Date, default: Date.now },
  summary: String,
  aiPlan: Object,
});

const onboardingSchema = new mongoose.Schema({
  sex: { type: String, enum: ["male", "female", "other"] },
  age: Number,
  heightCm: Number,
  weightKg: Number,
  diet: { type: String, enum: ["veg", "nonveg", "vegan", "other"] },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "high"],
  },
  equipment: [String],
});

const userSchema = new mongoose.Schema(
  {
    // ✅ Basic user info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },

    // ✅ Profile photo (new)
    avatar: {
      url: { type: String, default: "" },       // image URL (Cloudinary/local)
      publicId: { type: String, default: "" },  // Cloudinary ID (optional)
    },

    // Legacy fallback field (for backward compatibility)
    avatarUrl: String,

    // ✅ Physical & health info
    onboarding: onboardingSchema,
    bmi: { type: Number, default: null },
    bmiCategory: {
      type: String,
      default: "N/A",
      enum: ["N/A", "Underweight", "Normal", "Overweight", "Obese"],
    },

    // ✅ Fitness & AI tracking
    goals: [goalSchema],
    plans: [planSchema],

    // ✅ Role-based access control
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
