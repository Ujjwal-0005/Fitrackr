import React, { useState } from "react";
import { calculatePlates, groupPlates } from "../utils/plateCalculator";

const PlateCalculator = ({ targetWeight, onClose }) => {
  const [barWeight, setBarWeight] = useState(20);
  const result = calculatePlates(targetWeight || 0, barWeight);
  const groupedPlates = groupPlates(result.plates);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-400">🏋️ Plate Calculator</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Target Weight (kg)</label>
            <div className="text-3xl font-bold text-white">{targetWeight}kg</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Bar Weight (kg)</label>
            <select
              value={barWeight}
              onChange={(e) => setBarWeight(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-2 rounded"
            >
              <option value={20}>20kg (Standard Olympic Bar)</option>
              <option value={15}>15kg (Women's Olympic Bar)</option>
              <option value={10}>10kg (Technique Bar)</option>
              <option value={0}>0kg (Dumbbells/Other)</option>
            </select>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-yellow-400 mb-3">{result.message}</p>
            
            {groupedPlates.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-semibold">Load on EACH side:</p>
                {groupedPlates.map((plate) => (
                  <div key={plate.weight} className="flex justify-between items-center text-white">
                    <span className="text-lg">{plate.weight}kg plate</span>
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                      × {plate.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center text-gray-400 text-sm mt-4">
            Total: {targetWeight}kg = {barWeight}kg bar + {((targetWeight - barWeight) / 2).toFixed(2)}kg × 2 sides
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlateCalculator;
