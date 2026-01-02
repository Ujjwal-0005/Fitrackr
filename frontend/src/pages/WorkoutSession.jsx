// src/pages/WorkoutSession.jsx
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import {
  startSession,
  addExercise,
  addSet,
  markSetCompleted,
  concludeSession,
} from "../api/sessions";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Icon from "../components/Icon";

const WorkoutSession = () => {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [calories, setCalories] = useState(0);

  // ---------- INLINE SET FORM ----------
  const [activeSetForm, setActiveSetForm] = useState(null); // { exerciseIndex }
  const [newSet, setNewSet] = useState({ reps: 10, weightKg: 20 });

  // ---------- TIMER ----------
  const [timer, setTimer] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Fetch available exercises
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/exercises");
        setExerciseOptions(res.data.map((e) => ({ value: e._id, label: e.name })));
      } catch (err) {
        toast.error("Failed to load exercises");
      }
    })();
  }, []);

  // Cleanup timer when unmounted
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Timer controls
  const startTimer = () => {
    if (isRunning) return;
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    setIsRunning(true);
    toast.info("Timer started!");
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    toast.warning("⏸ Timer paused");
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(0);
    setIsRunning(false);
    toast.info("Timer reset");
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  // Smart increment/decrement functions for sets
  const adjustReps = (delta) => {
    setNewSet((prev) => ({
      ...prev,
      reps: Math.max(1, prev.reps + delta), // Minimum 1 rep
    }));
  };

  const adjustWeight = (delta) => {
    setNewSet((prev) => ({
      ...prev,
      weightKg: Math.max(0, Number((prev.weightKg + delta).toFixed(1))), // Minimum 0kg, round to 1 decimal
    }));
  };

  // Start a new workout session
  const handleStartSession = async () => {
    try {
      const res = await startSession();
      setSession(res.data.session);
      setExercises([]);
      setCalories(0);
      setTimer(0);
      toast.success("New workout session started!");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.session) {
        setSession(err.response.data.session);
        toast.info("Resumed existing session!");
      } else {
        toast.error(err.response?.data?.message || "Failed to start session");
      }
    }
  };

  // Add exercise
  const handleAddExercise = async (selected) => {
    if (!session) return toast.warning("Start a session first!");
    try {
      const cleanId = selected.value.split("-")[0];
      const res = await addExercise({
        sessionId: session._id,
        exerciseId: cleanId,
        nameSnapshot: selected.label,
        muscleSnapshot: ["chest", "arms", "legs"],
      });

      setExercises((prev) => [
        ...prev,
        { ...res.data.exercise, sets: [], completed: false },
      ]);
      toast.success(`Added ${selected.label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add exercise");
    }
  };

  // Add a set
  const handleAddSet = async (exerciseIndex) => {
    // Validate inputs
    if (!newSet.reps || newSet.reps < 1) return toast.warning("?? Reps must be at least 1");
    if (newSet.weightKg < 0) return toast.warning("?? Weight cannot be negative");
    const reps = Math.max(1, Math.round(newSet.reps));
    const weightKg = Math.max(0, Number(newSet.weightKg.toFixed(1)));

    const ex = exercises[exerciseIndex];
    try {
      const res = await addSet({
        sessionId: session._id,
        exerciseId: ex.exerciseId,
        reps,
        weightKg,
      });

      const updatedExercise = res.data?.exercise;
      if (!updatedExercise) return toast.error("Server didn't return updated exercise.");

      setExercises((prev) => {
        const updated = [...prev];
        updated[exerciseIndex] = updatedExercise;
        return updated;
      });

      setCalories((c) => c + reps * weightKg * 0.1);
      setActiveSetForm(null); // Close form
      setNewSet({ reps: 10, weightKg: 20 }); // Reset for next set
      toast.success("? Set added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add set");
    }
  };

  const handleMarkCompleted = async (exerciseIndex, setIndex) => {
    try {
      const ex = exercises[exerciseIndex];
      const set = ex.sets[setIndex];
      if (!set._id) return toast.error("Missing set ID");

      await markSetCompleted({
        sessionId: session._id,
        exerciseId: ex.exerciseId,
        setId: set._id,
      });

      setExercises((prev) => {
        const updated = [...prev];
        updated[exerciseIndex].sets[setIndex].completed = true;
        return updated;
      });
      toast.success("Set marked completed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to mark completed");
    }
  };

  const handleRemoveExercise = (exerciseIndex) => {
    const removed = exercises[exerciseIndex]?.nameSnapshot;
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
    toast.info(`Removed ${removed || "exercise"}`);
  };

  const allCompleted =
    exercises.length > 0 &&
    exercises.every((ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed));

  const handleFinish = async () => {
    if (!allCompleted) return toast.warning("Complete all sets before finishing!");
    stopTimer();

    try {
      const durationMin = Math.max(1, Math.round(timer / 60));
      await concludeSession(session._id, {
        calories,
        durationMin,
        status: "completed",
      });
      toast.success("Workout session completed!");
      setSession(null);
      setExercises([]);
      setCalories(0);
      setTimer(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to conclude workout");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">
        {user?.name ? `${user.name}'s Workout Session` : "Workout Session"}
      </h1>

      {/* Timer Controls */}
      {session && (
        <div className="bg-gray-100 rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
            ⏱ {Math.floor(timer / 60)}m {String(timer % 60).padStart(2, "0")}s
          </div>
          <div className="space-x-2">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ▶️ Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                ⏸ Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {!session ? (
        <div className="flex justify-center items-center py-12">
          <button
            onClick={handleStartSession}
            className="bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold text-lg px-12 py-5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Start New Session
          </button>
        </div>
      ) : (
        <>
          {/* Exercise Select */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Add Exercise</h2>
            <Select
              options={exerciseOptions}
              onChange={handleAddExercise}
              placeholder="Search exercise..."
            />
          </div>

          {/* Exercises List */}
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-blue-800 mb-1">
                    {ex.nameSnapshot}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {ex.muscleSnapshot?.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveExercise(i)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>

              {/* Add Set Form */}
              {activeSetForm?.exerciseIndex === i ? (
                <div className="mt-3 bg-white p-4 rounded-lg border-2 border-[#FE9A00] shadow-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Reps Control */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reps</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustReps(-1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={newSet.reps}
                          onChange={(e) => setNewSet({ ...newSet, reps: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-bold text-lg"
                        />
                        <button
                          onClick={() => adjustReps(1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Weight Control */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustWeight(-2.5)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={newSet.weightKg}
                          onChange={(e) => setNewSet({ ...newSet, weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-bold text-lg"
                        />
                        <button
                          onClick={() => adjustWeight(2.5)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddSet(i)}
                      className="flex-1 bg-[#FE9A00] hover:bg-[#FFA500] text-white font-bold px-4 py-2 rounded-lg transition"
                    >
                      Save Set
                    </button>
                    <button
                      onClick={() => setActiveSetForm(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveSetForm({ exerciseIndex: i });
                    setNewSet({ reps: 10, weightKg: 20 }); // Reset to defaults
                  }}
                  className="bg-[#FE9A00] hover:bg-[#FFA500] text-white font-semibold px-4 py-2 rounded-lg mt-2 transition"
                >
                  ➕ Add Set
                </button>
              )}

              <div className="mt-3 space-y-2">
                {ex.sets.map((set, j) => (
                  <div
                    key={`${i}-${j}-${set._id || "local"}`}
                    className={`flex items-center justify-between border p-2 rounded-md ${set.completed ? "bg-green-50" : "bg-white"
                      }`}
                  >
                    <span>
                      {set.reps} reps × {set.weightKg}kg
                    </span>
                    <div className="space-x-2">
                      {!set.completed && (
                        <button
                          onClick={() => handleMarkCompleted(i, j)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary and Finish Button */}
          {exercises.length > 0 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mt-6">
              <p className="font-semibold text-gray-700">
                Total Calories:{" "}
                <span className="text-green-700 font-bold">
                  {Math.round(calories)} kcal
                </span>
              </p>
              <button
                onClick={handleFinish}
                disabled={!allCompleted}
                className={`px-6 py-2 rounded-lg text-white ${allCompleted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Finish Workout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutSession;
