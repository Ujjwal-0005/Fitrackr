import React, { useEffect, useState } from "react";
import { getWorkoutStreak } from "../api/streak";
import { motion } from "framer-motion";

const StreakDisplay = () => {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const res = await getWorkoutStreak();
      setStreak(res.data);
    } catch (err) {
      console.error("Failed to load streak");
    }
  };

  if (!streak) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-400/40 p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-orange-300">Workout Streak</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-orange-400 mb-2">
            {streak.currentStreak}
          </div>
          <p className="text-gray-400 text-sm">Current Streak</p>
          <p className="text-xs text-gray-500">days in a row</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {streak.longestStreak}
          </div>
          <p className="text-gray-400 text-sm">Longest Streak</p>
          <p className="text-xs text-gray-500">personal best</p>
        </div>
      </div>

      {streak.currentStreak >= 7 && (
        <div className="mt-4 text-center">
          <p className="text-yellow-300 font-semibold animate-pulse">
            🌟 Amazing! Keep it up!
          </p>
        </div>
      )}

      {streak.lastWorkout && (
        <p className="text-gray-500 text-xs mt-3 text-center">
          Last workout: {new Date(streak.lastWorkout).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
};

export default StreakDisplay;
