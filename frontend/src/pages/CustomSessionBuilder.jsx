import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createCustomSession, getGoalDefaults } from "../api/customSessions";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

export default function CustomSessionBuilder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const goalId = searchParams.get("goalId");

    const [sessionName, setSessionName] = useState("");
    const [focus, setFocus] = useState("custom");
    const [exercises, setExercises] = useState([]);
    const [defaults, setDefaults] = useState(null);
    const [loading, setLoading] = useState(true);

    // Exercise input state
    const [exerciseName, setExerciseName] = useState("");
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [weight, setWeight] = useState(0);
    const [rest, setRest] = useState(60);

    useEffect(() => {
        loadDefaults();
    }, [goalId]);

    const loadDefaults = async () => {
        try {
            const { defaults: goalDefaults } = await getGoalDefaults(goalId);
            setDefaults(goalDefaults);

            // Pre-fill with goal-aware defaults
            if (goalDefaults.repRange) {
                setReps(goalDefaults.repRange[0]);
            }
            if (goalDefaults.restSeconds) {
                setRest(goalDefaults.restSeconds);
            }
            if (goalDefaults.setsPerExercise) {
                setSets(goalDefaults.setsPerExercise);
            }
        } catch (err) {
            console.error("Failed to load defaults:", err);
        } finally {
            setLoading(false);
        }
    };

    const addExercise = () => {
        if (!exerciseName.trim()) {
            toast.error("Enter exercise name");
            return;
        }

        const newExercise = {
            name: exerciseName,
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseFloat(weight),
            rest: parseInt(rest),
        };

        setExercises([...exercises, newExercise]);

        // Reset inputs
        setExerciseName("");
        setWeight(0);
    };

    const removeExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!sessionName.trim()) {
            toast.error("Enter session name");
            return;
        }

        if (exercises.length === 0) {
            toast.error("Add at least one exercise");
            return;
        }

        try {
            const sessionData = {
                sessionName,
                focus,
                exercises,
                goalId: goalId || undefined,
                estimatedDuration: exercises.length * 5, // Rough estimate
            };

            await createCustomSession(sessionData);
            toast.success("Custom session created!");
            navigate("/custom-sessions");
        } catch (err) {
            console.error("Failed to create session:", err);
            toast.error("Failed to create session");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
                <div className="text-sm text-[#6b7280] uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <div className="relative pt-32 pb-12">
                <div className="w-full px-8 max-w-[95vw] mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-8 pb-6 border-b border-[#1a1d23]"
                    >
                        <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">
                            Custom Workout Session
                        </h1>
                        {defaults?.goalStatement && (
                            <p className="text-sm text-[#9ca3af]">
                                Goal: {defaults.goalStatement}
                            </p>
                        )}
                    </motion.div>

                    {/* Goal-Aware Defaults Info */}
                    {defaults && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className="mb-8 bg-[#1a1d23] p-6 border border-[#4b5563]"
                        >
                            <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                                Suggested Training Parameters
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-[#6b7280] mb-1">Frequency</p>
                                    <p className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {defaults.suggestedFrequency}×/week
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6b7280] mb-1">Rep Range</p>
                                    <p className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {defaults.repRange[0]}-{defaults.repRange[1]}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6b7280] mb-1">Rest</p>
                                    <p className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {defaults.restSeconds}s
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6b7280] mb-1">Sets</p>
                                    <p className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        {defaults.setsPerExercise}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Session Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="mb-8 bg-[#1a1d23] p-6 border border-[#4b5563]"
                    >
                        <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                            Session Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="e.g., Push Day A"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00]"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Focus
                                </label>
                                <select
                                    value={focus}
                                    onChange={(e) => setFocus(e.target.value)}
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00]"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    <option value="push">Push</option>
                                    <option value="pull">Pull</option>
                                    <option value="legs">Legs</option>
                                    <option value="full_body">Full Body</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Add Exercise */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.15 }}
                        className="mb-8 bg-[#1a1d23] p-6 border border-[#4b5563]"
                    >
                        <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                            Add Exercise
                        </h3>

                        <div className="grid grid-cols-5 gap-4 mb-4">
                            <div className="col-span-2">
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Exercise Name
                                </label>
                                <input
                                    type="text"
                                    value={exerciseName}
                                    onChange={(e) => setExerciseName(e.target.value)}
                                    placeholder="e.g., Bench Press"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Sets
                                </label>
                                <input
                                    type="number"
                                    value={sets}
                                    onChange={(e) => setSets(e.target.value)}
                                    min="1"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00] tabular-nums"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Reps
                                </label>
                                <input
                                    type="number"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    min="1"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00] tabular-nums"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    min="0"
                                    step="2.5"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00] tabular-nums"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                />
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-[#6b7280] uppercase tracking-wider mb-2">
                                    Rest (seconds)
                                </label>
                                <input
                                    type="number"
                                    value={rest}
                                    onChange={(e) => setRest(e.target.value)}
                                    min="0"
                                    step="15"
                                    className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00] tabular-nums"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                />
                            </div>

                            <button
                                onClick={addExercise}
                                className="bg-[#FE9A00] text-black px-6 py-3 font-medium text-sm hover:bg-[#00c4cc] transition-colors"
                            >
                                ADD EXERCISE
                            </button>
                        </div>
                    </motion.div>

                    {/* Exercise List */}
                    {exercises.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.2 }}
                            className="mb-8"
                        >
                            <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                                Exercises ({exercises.length})
                            </h3>

                            <div className="border border-[#4b5563]">
                                {/* Table Header */}
                                <div className="bg-[#1a1d23] border-b border-[#4b5563] px-6 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-6">
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Exercise</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Sets</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Reps</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Weight</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Rest</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Action</p>
                                </div>

                                {/* Table Rows */}
                                {exercises.map((exercise, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#0f1115] hover:bg-[#2a3038] border-b border-[#4b5563] last:border-b-0 px-6 py-4 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-6 transition-colors"
                                    >
                                        <p className="text-sm text-white font-medium">{exercise.name}</p>
                                        <p className="text-sm text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exercise.sets}</p>
                                        <p className="text-sm text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exercise.reps}</p>
                                        <p className="text-sm text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exercise.weight}kg</p>
                                        <p className="text-sm text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exercise.rest}s</p>
                                        <button
                                            onClick={() => removeExercise(index)}
                                            className="text-sm text-[#ef4444] hover:text-[#f87171] transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.25 }}
                        className="flex gap-4"
                    >
                        <button
                            onClick={() => navigate("/workout-plans")}
                            className="px-6 py-3 text-sm font-medium bg-[#1a1d23] text-white hover:bg-[#4b5563] transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-6 py-3 text-sm font-medium bg-[#FE9A00] text-black hover:bg-[#00c4cc] transition-colors"
                        >
                            SAVE SESSION
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
