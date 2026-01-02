import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { Goal } from "../models/Goal.js";
/* ------------------ BMI Helpers ------------------ */
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
};

const interpretBMI = (bmi) => {
  if (!bmi) return "N/A";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 24.9) return "Normal";
  if (bmi < 29.9) return "Overweight";
  return "Obese";
};

/* ------------------ GET current user ------------------ */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ getMe failed:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* ------------------ GET onboarding data ------------------ */
export const getOnboarding = async (req, res) => {
  try {
    const user = req.user;
    const ob = user?.onboarding || {};

    const bmi = calculateBMI(ob.weightKg, ob.heightCm);
    const bmiCategory = interpretBMI(bmi);

    res.json({
      onboarding: ob,
      bmi,
      bmiCategory,
    });
  } catch (e) {
    logger.error("❌ getOnboarding failed:", e);
    res.status(500).json({ message: "Failed to load onboarding info" });
  }
};

/* ------------------ UPDATE onboarding ------------------ */
export const updateOnboarding = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    // ✅ Calculate BMI if height and weight provided
    const bmi = calculateBMI(data.weightKg, data.heightCm);
    const bmiCategory = interpretBMI(bmi);

    // ✅ Clean empty enum values (prevent validation errors)
    const cleanData = { ...data };
    if (!cleanData.sex) delete cleanData.sex;
    if (!cleanData.diet) delete cleanData.diet;
    if (!cleanData.activityLevel) delete cleanData.activityLevel;

    // ✅ Save onboarding info
    user.onboarding = {
      ...user.onboarding,
      ...cleanData,
    };

    // ✅ Store BMI in user doc
    user.bmi = bmi;
    user.bmiCategory = bmiCategory;

    // ✅ Mark profile as complete
    user.isProfileComplete = true;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      onboarding: user.onboarding,
      bmi,
      bmiCategory,
    });
  } catch (err) {
    logger.error("❌ updateOnboarding failed:", err);
    res.status(500).json({ message: "Server error while updating onboarding" });
  }
};

/* ------------------ CHANGE PASSWORD ------------------ */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    logger.error("❌ changePassword failed:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};

/* ------------------ GET Overview stats ------------------ */
export const getOverview = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      status: "completed",
    });

    const totalWorkouts = sessions.length;
    const totalCalories = sessions.reduce((sum, s) => sum + (s.calories || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMin || 0), 0);
    const avgDuration = totalWorkouts ? totalMinutes / totalWorkouts : 0;

    res.json({
      totalWorkouts,
      totalCalories,
      totalMinutes,
      avgDuration,
    });
  } catch (err) {
    logger.error("❌ getOverview failed:", err);
    res.status(500).json({ message: "Failed to fetch overview stats" });
  }
};

/* ------------------ GET Weekly stats ------------------ */
export const getWeeklyStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6); // include 7 days total

    const sessions = await Session.find({
      userId: req.user._id,
      status: "completed",
      date: { $gte: weekAgo, $lte: now },
    });

    // initialize all 7 days with 0 calories
    const days = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekAgo);
      day.setDate(weekAgo.getDate() + i);
      const key = day.toISOString().split("T")[0];
      days[key] = 0;
    }

    sessions.forEach((s) => {
      const dayKey = new Date(s.date).toISOString().split("T")[0];
      if (days[dayKey] !== undefined) {
        days[dayKey] += s.calories || 0;
      }
    });

    const formatted = Object.entries(days).map(([date, calories]) => ({
      date,
      calories,
    }));

    res.json(formatted);
  } catch (err) {
    logger.error("❌ getWeeklyStats failed:", err);
    res.status(500).json({ message: "Failed to fetch weekly stats" });
  }
};

/* ------------------ UPSERT Goal ------------------ */
export const upsertGoal = async (req, res) => {
  try {
    const { type, target, targetDate, isActive } = req.body;
    const existing = await Goal.findOne({ userId: req.user._id, type });

    if (existing) {
      existing.target = target;
      existing.targetDate = targetDate;
      existing.isActive = isActive;
      await existing.save();
      return res.json({ message: "Goal updated", goal: existing });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      type,
      target,
      targetDate,
      isActive,
    });
    res.status(201).json({ message: "Goal created", goal });
  } catch (err) {
    logger.error("❌ upsertGoal failed:", err);
    res.status(500).json({ message: "Failed to save goal" });
  }
};

/* ------------------ GET Goal Progress ------------------ */
export const getGoalProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id, isActive: true });
    const sessions = await Session.find({
      userId: req.user._id,
      status: "completed",
    });

    const totalCalories = sessions.reduce((sum, s) => sum + (s.calories || 0), 0);

    const progress = goals.map((g) => ({
      type: g.type,
      target: g.target,
      percent:
        g.type === "fat_loss"
          ? Math.min(100, (totalCalories / 7000) * 100) // ~7000 kcal = 1kg
          : Math.min(100, (sessions.length / 20) * 100),
    }));

    res.json(progress);
  } catch (err) {
    logger.error("❌ getGoalProgress failed:", err);
    res.status(500).json({ message: "Failed to fetch goal progress" });
  }
};

/* ------------------ UPLOAD Avatar ------------------ */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert buffer to base64 data URL
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    user.avatarUrl = base64Image;
    if (!user.avatar) user.avatar = {};
    user.avatar.url = base64Image;

    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: base64Image
    });
  } catch (err) {
    logger.error("❌ uploadAvatar failed:", err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};
