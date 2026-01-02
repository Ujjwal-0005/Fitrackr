import { Session } from "../models/Session.js";
// SmartSession import removed
import { User } from "../models/User.js";
// @desc  Calculate user's current workout streak
// @route GET /api/v1/users/me/streak
// @access Private
export const getWorkoutStreak = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all completed sessions from both models
    const regularSessions = await Session.find({
      userId,
      status: "completed",
    }).sort({ date: -1 });

    const smartSessions = []; // SmartSession removed

    // Combine and sort all sessions
    const allSessions = [...regularSessions].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    if (allSessions.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0, lastWorkout: null });
    }

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    const sessionDates = allSessions.map((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = uniqueDates[i];
      const diffDays = Math.floor((checkDate.getTime() - sessionDate) / (1000 * 60 * 60 * 24));

      if (diffDays === currentStreak) {
        currentStreak++;
      } else if (diffDays === currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const daysDiff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    res.json({
      currentStreak,
      longestStreak,
      lastWorkout: allSessions[0].date,
      totalWorkouts: allSessions.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
