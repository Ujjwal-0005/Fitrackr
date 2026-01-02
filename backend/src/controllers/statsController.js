import { Session } from "../models/Session.js";
// SmartSession import removed
import mongoose from "mongoose";
// ✅ Overview stats: total workouts, calories, duration
export const getOverviewStats = async (req, res) => {
  try {
    // Get regular sessions
    const sessions = await Session.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id), status: "completed" } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalCalories: { $sum: "$calories" },
          totalMinutes: { $sum: "$durationMin" },
          avgDuration: { $avg: "$durationMin" }
        }
      }
    ]);

    // Get smart sessions
    const smartSessions = []; // SmartSession removed

    // Combine both
    const regularStats = sessions[0] || { totalWorkouts: 0, totalCalories: 0, totalMinutes: 0, avgDuration: 0 };
    const smartStats = { totalWorkouts: 0, totalVolume: 0, totalMinutes: 0, avgDuration: 0 };

    const combined = {
      totalWorkouts: regularStats.totalWorkouts + smartStats.totalWorkouts,
      totalCalories: regularStats.totalCalories + (smartStats.totalVolume * 0.05), // Estimate calories from volume
      totalMinutes: regularStats.totalMinutes + smartStats.totalMinutes,
      avgDuration: (regularStats.avgDuration || 0) + (smartStats.avgDuration || 0) > 0
        ? (regularStats.avgDuration || 0)
        : 0
    };

    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Sessions by date (for calendar view)
export const getSessionsByDate = async (req, res) => {
  try {
    const { date } = req.query; // "YYYY-MM-DD"
    const localDate = new Date(date);
    const start = new Date(localDate.setHours(0, 0, 0, 0));
    const end = new Date(localDate.setHours(23, 59, 59, 999));

    const sessions = await Session.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ startTime: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Weekly summary (for charts)
export const getWeeklyStats = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    // Get regular sessions
    const regularData = await Session.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          status: "completed",
          date: { $gte: since }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          calories: { $sum: "$calories" },
          duration: { $sum: "$durationMin" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get smart sessions
    const smartData = []; // SmartSession removed

    // Merge both datasets
    const combined = {};
    regularData.forEach(d => {
      combined[d._id] = { _id: d._id, calories: d.calories, duration: d.duration };
    });
    smartData.forEach(d => {
      if (combined[d._id]) {
        combined[d._id].calories += d.calories;
        combined[d._id].duration += d.duration;
      } else {
        combined[d._id] = { _id: d._id, calories: d.calories, duration: d.duration };
      }
    });

    const result = Object.values(combined).sort((a, b) => a._id.localeCompare(b._id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Muscle breakdown (optional, snapshot-based)
export const getMuscleBreakdown = async (req, res) => {
  try {
    const sessions = await Session.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id), status: "completed" } },
      { $unwind: "$exercises" },
      {
        $unwind: {
          path: "$exercises.muscleSnapshot",
          preserveNullAndEmptyArrays: true  // Keep exercises even if no muscle data
        }
      },
      {
        $group: {
          _id: {
            $ifNull: ["$exercises.muscleSnapshot", "Unknown"]  // Default to "Unknown" if null
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("Muscle breakdown result:", sessions);
    res.json(sessions);
  } catch (err) {
    console.error("Muscle breakdown error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
