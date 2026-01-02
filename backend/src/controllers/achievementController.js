import { Achievement } from "../models/Achievement.js";
import { Session } from "../models/Session.js";
const ACHIEVEMENT_DEFINITIONS = {
  first_workout: { title: "First Steps", description: "Completed your first workout", icon: "🏁" },
  "10_workouts": { title: "Getting Started", description: "Completed 10 workouts", icon: "💪" },
  "50_workouts": { title: "Dedicated", description: "Completed 50 workouts", icon: "🔥" },
  "100_workouts": { title: "Centurion", description: "Completed 100 workouts", icon: "🏆" },
  "500_workouts": { title: "Legend", description: "Completed 500 workouts", icon: "👑" },
  first_pr: { title: "Personal Best", description: "Set your first personal record", icon: "⭐" },
  "7_day_streak": { title: "Week Warrior", description: "7 day workout streak", icon: "🔥" },
  "30_day_streak": { title: "Monthly Master", description: "30 day workout streak", icon: "💎" },
  "100_day_streak": { title: "Unstoppable", description: "100 day workout streak", icon: "🚀" },
  "10k_calories": { title: "Calorie Crusher", description: "Burned 10,000 calories", icon: "⚡" },
  "50k_calories": { title: "Inferno", description: "Burned 50,000 calories", icon: "🔥" },
  "100k_calories": { title: "Phoenix", description: "Burned 100,000 calories", icon: "🌟" },
};

// @desc  Get all achievements for user
// @route GET /api/v1/achievements
// @access Private
export const getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort({ unlockedAt: -1 });
    res.json(achievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Check and unlock achievements
// @route POST /api/v1/achievements/check
// @access Private
export const checkAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const newAchievements = [];

    // Get user stats
    const completedSessions = await Session.countDocuments({
      userId,
      status: "completed",
    });

    const totalCalories = await Session.aggregate([
      { $match: { userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$calories" } } },
    ]);

    const calories = totalCalories[0]?.total || 0;

    // Check workout count achievements
    const workoutMilestones = {
      1: "first_workout",
      10: "10_workouts",
      50: "50_workouts",
      100: "100_workouts",
      500: "500_workouts",
    };

    for (const [count, type] of Object.entries(workoutMilestones)) {
      if (completedSessions >= parseInt(count)) {
        const existing = await Achievement.findOne({ userId, type });
        if (!existing) {
          const achievement = await Achievement.create({
            userId,
            type,
            ...ACHIEVEMENT_DEFINITIONS[type],
          });
          newAchievements.push(achievement);
        }
      }
    }

    // Check calorie achievements
    const calorieMilestones = {
      10000: "10k_calories",
      50000: "50k_calories",
      100000: "100k_calories",
    };

    for (const [threshold, type] of Object.entries(calorieMilestones)) {
      if (calories >= parseInt(threshold)) {
        const existing = await Achievement.findOne({ userId, type });
        if (!existing) {
          const achievement = await Achievement.create({
            userId,
            type,
            ...ACHIEVEMENT_DEFINITIONS[type],
          });
          newAchievements.push(achievement);
        }
      }
    }

    res.json({
      message: `Unlocked ${newAchievements.length} new achievements`,
      newAchievements,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
