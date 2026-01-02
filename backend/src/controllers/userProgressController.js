import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
export const getUsersProgress = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, "name email").lean();

    // Aggregate sessions by userId
    const sessionStats = await Session.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          totalCalories: { $sum: { $ifNull: ["$calories", 0] } },
          totalDuration: { $sum: { $ifNull: ["$durationMin", 0] } },
        },
      },
    ]);

    // Map aggregation by userId
    const statsMap = {};
    sessionStats.forEach((stat) => {
      statsMap[stat._id?.toString()] = stat;
    });

    // Merge user info with session stats
    const result = users.map((u) => {
      const s = statsMap[u._id.toString()] || {};
      return {
        userId: u._id,
        name: u.name,
        email: u.email,
        totalSessions: s.totalSessions || 0,
        totalCalories: s.totalCalories || 0,
        totalDuration: s.totalDuration || 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ getUsersProgress failed:", err);
    res.status(500).json({ message: "Server error fetching user progress" });
  }
};
