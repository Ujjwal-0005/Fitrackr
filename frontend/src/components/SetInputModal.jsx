import React, { useState } from "react";

const SetInputModal = ({ exerciseName, lastSet, onSubmit, onClose }) => {
  const [reps, setReps] = useState(lastSet?.reps || "");
  const [weight, setWeight] = useState(lastSet?.weightKg || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reps: Number(reps), weightKg: Number(weight) });
  };

  const handleDuplicate = () => {
    if (lastSet) {
      onSubmit({ reps: lastSet.reps, weightKg: lastSet.weightKg });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          Add Set - {exerciseName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-lg text-lg"
              placeholder="12"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-lg text-lg"
              placeholder="60"
              required
            />
          </div>

          {lastSet && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Last Set:</p>
              <p className="text-white">
                <strong>{lastSet.reps}</strong> reps × <strong>{lastSet.weightKg}</strong>kg
              </p>
              <button
                type="button"
                onClick={handleDuplicate}
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Duplicate Last Set
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 py-3 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Add Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetInputModal;
