import React, { useState } from "react";

const PlanCard = ({ plan, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white shadow rounded-xl p-4 border">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-blue-700">{plan.title}</h3>
        <div className="space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {expanded ? "Hide" : "View"}
          </button>
          <button
            onClick={onDelete}
            className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-gray-700">{plan.aiPlan.summary}</p>
          <div className="grid md:grid-cols-2 gap-3">
            {plan.aiPlan.days.map((day, i) => (
              <div key={i} className="border p-3 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {day.day} — {day.focus}
                </h4>
                <p className="text-sm text-gray-500">
                  {day.calories} kcal
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                  {day.exercises.map((ex, idx) => (
                    <li key={idx}>
                      {ex.name} — {ex.sets}×{ex.reps} ({ex.rest})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="italic text-gray-600 mt-2">💡 {plan.aiPlan.weeklyTip}</p>
        </div>
      )}
    </div>
  );
};

export default PlanCard;
