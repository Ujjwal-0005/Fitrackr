import React, { useEffect, useState } from "react";
import { getGoalProgress } from "../api/goals";

const GoalProgress = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await getGoalProgress();
        setGoals(res.data);
      } catch (err) {
        console.error("Failed to fetch goal progress", err);
      }
    };
    fetchGoals();
  }, []);

  if (!goals.length)
    return <p className="text-center text-gray-500 mt-4">No active goals yet.</p>;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
        My Goals Progress
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white shadow p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <h3 className="text-blue-700 font-semibold capitalize">
                {goal.type.replace("_", " ")}
              </h3>
              <span className="text-sm text-gray-500">{goal.target}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-600 mt-1">
              {goal.progress}% complete —{" "}
              {goal.progress >= 100
                ? "🎉 Goal achieved!"
                : "Keep going, you're doing great!"}
            </p>

            {goal.targetDate && (
              <p className="text-xs text-gray-400 mt-1">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalProgress;
