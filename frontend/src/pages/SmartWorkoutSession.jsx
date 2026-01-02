import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { startSession, logSet, completeSession } from "../api/smartSessions";
import Icon from "../components/Icon";

export default function SmartWorkoutSession() {
  const navigate = useNavigate();
  const { planId, sessionIndex } = useParams();

  const [session, setSession] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setInput, setSetInput] = useState({ reps: "", weight: "", rpe: 7 });
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState({
    difficulty: "perfect",
    energy: 7,
    recovery: 7,
    notes: "",
  });

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      const response = await startSession(planId, Number(sessionIndex));
      setSession(response.session);
      setSessionStartTime(Date.now());

      // Pre-fill weight from suggestion
      const firstExercise = response.session.exercises[0];
      setSetInput({
        reps: firstExercise.planned.reps[0],
        weight: firstExercise.planned.weight,
        rpe: firstExercise.planned.rpe,
      });
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleLogSet = async () => {
    try {
      await logSet(session._id, currentExerciseIndex, {
        ...setInput,
        reps: Number(setInput.reps),
        weight: Number(setInput.weight),
        rpe: Number(setInput.rpe),
        restSeconds: 90,
      });

      // Update local state
      const updatedSession = { ...session };
      updatedSession.exercises[currentExerciseIndex].actual.sets.push({
        ...setInput,
        completed: true,
      });
      setSession(updatedSession);

      const currentExercise = session.exercises[currentExerciseIndex];
      const completedSets = currentExercise.actual.sets.length + 1;

      // Move to next set or exercise
      if (completedSets >= currentExercise.planned.sets) {
        if (currentExerciseIndex < session.exercises.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSetIndex(0);

          // Pre-fill next exercise
          const nextExercise = session.exercises[currentExerciseIndex + 1];
          setSetInput({
            reps: nextExercise.planned.reps[0],
            weight: nextExercise.planned.weight,
            rpe: nextExercise.planned.rpe,
          });
        } else {
          setIsComplete(true);
        }
      } else {
        setCurrentSetIndex(currentSetIndex + 1);
      }
    } catch (err) {
      console.error("Failed to log set:", err);
    }
  };

  const handleCompleteSession = async () => {
    try {
      const duration = Math.floor((Date.now() - sessionStartTime) / 60000);
      await completeSession(session._id, {
        ...feedback,
        duration,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your workout...</p>
        </div>
      </div>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const completedSets = currentExercise?.actual?.sets?.length || 0;
  const totalSets = currentExercise?.planned?.sets || 0;
  const progress = ((currentExerciseIndex + (completedSets / totalSets)) / session.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Progress */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white"
            >
              ← Exit
            </button>
            <div className="text-sm text-zinc-400">
              {currentExerciseIndex + 1} / {session.exercises.length} exercises
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Exercise Name */}
              <div className="mb-8">
                <h1 className="text-5xl font-bold mb-2">{currentExercise.name}</h1>
                <p className="text-zinc-400 text-lg">
                  Set {completedSets + 1} of {totalSets}
                </p>
              </div>

              {/* Target Display */}
              <div className="bg-zinc-900 rounded-2xl p-6 mb-8 border-2 border-zinc-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-zinc-400 text-sm mb-1">Target Reps</div>
                    <div className="text-3xl font-bold">
                      {currentExercise.planned.reps[0]}-{currentExercise.planned.reps[1]}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-sm mb-1">Suggested Weight</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {currentExercise.planned.weight || 0} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-sm mb-1">Target RPE</div>
                    <div className="text-3xl font-bold">{currentExercise.planned.rpe}/10</div>
                  </div>
                </div>
              </div>

              {/* Completed Sets */}
              {completedSets > 0 && (
                <div className="mb-8">
                  <h3 className="text-zinc-400 text-sm mb-3">Completed Sets</h3>
                  <div className="space-y-2">
                    {currentExercise.actual.sets.map((set, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-zinc-400">Set {idx + 1}</span>
                        <span className="font-bold">
                          {set.reps} reps × {set.weight} kg
                        </span>
                        <span className="text-yellow-400">RPE {set.rpe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Reps Completed</label>
                  <input
                    type="number"
                    value={setInput.reps}
                    onChange={(e) => setSetInput({ ...setInput, reps: e.target.value })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-5 text-3xl font-bold text-center focus:border-yellow-400 outline-none"
                    placeholder="10"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={setInput.weight}
                    onChange={(e) => setSetInput({ ...setInput, weight: e.target.value })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-5 text-3xl font-bold text-center focus:border-yellow-400 outline-none"
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">
                    RPE (Rate of Perceived Exertion): {setInput.rpe}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={setInput.rpe}
                    onChange={(e) => setSetInput({ ...setInput, rpe: e.target.value })}
                    className="w-full h-3 bg-zinc-800 rounded-full appearance-none slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>Easy</span>
                    <span>Moderate</span>
                    <span>Max Effort</span>
                  </div>
                </div>
              </div>

              {/* Log Set Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogSet}
                className="w-full bg-yellow-400 text-black font-bold rounded-xl py-5 text-lg"
              >
                Log Set ✓
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center mb-12">
                <div className="text-7xl mb-4"><Icon name="party" className="w-20 h-20 text-[#FE9A00]" /></div>
                <h1 className="text-5xl font-bold mb-2">Session Complete!</h1>
                <p className="text-zinc-400 text-lg">
                  {Math.floor((Date.now() - sessionStartTime) / 60000)} minutes
                </p>
              </div>

              {/* Feedback Form */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-zinc-400 text-sm mb-3 block">
                    How was the difficulty?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["too_easy", "perfect", "challenging", "too_hard"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFeedback({ ...feedback, difficulty: level })}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${feedback.difficulty === level
                          ? "bg-yellow-400 text-black"
                          : "bg-zinc-900 text-white"
                          }`}
                      >
                        {level.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">
                    Energy Level: {feedback.energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedback.energy}
                    onChange={(e) => setFeedback({ ...feedback, energy: Number(e.target.value) })}
                    className="w-full h-3 bg-zinc-800 rounded-full"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">
                    Recovery Feeling: {feedback.recovery}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedback.recovery}
                    onChange={(e) => setFeedback({ ...feedback, recovery: Number(e.target.value) })}
                    className="w-full h-3 bg-zinc-800 rounded-full"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Notes (optional)</label>
                  <textarea
                    value={feedback.notes}
                    onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 focus:border-yellow-400 outline-none"
                    rows="3"
                    placeholder="How did you feel?"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteSession}
                className="w-full bg-yellow-400 text-black font-bold rounded-xl py-5 text-lg"
              >
                Finish Workout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #facc15;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #facc15;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
