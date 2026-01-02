import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createSmartGoal } from "../api/smartGoals";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function GoalSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [goalData, setGoalData] = useState({
    userStats: {
      currentWeight: "",
      height: "",
      age: "",
      gender: "",
      activityLevel: ""
    },
    type: "",
    targetWeight: "",
    durationWeeks: 12,
    workoutsPerWeek: 4,
    constraints: {
      equipment: [],
      location: "",
      injuries: []
    }
  });

  // Pre-fill user stats from profile if available
  useEffect(() => {
    if (user?.onboarding) {
      setGoalData(prev => ({
        ...prev,
        userStats: {
          currentWeight: user.onboarding.weightKg || "",
          height: user.onboarding.heightCm || "",
          age: user.onboarding.age || "",
          gender: user.onboarding.sex || "",
          activityLevel: prev.userStats.activityLevel // Keep empty, user needs to select
        }
      }));
    }
  }, [user]);

  // Pre-fill user stats from profile if available
  useEffect(() => {
    if (user?.onboarding) {
      const prefilled = {
        currentWeight: user.onboarding.weightKg || "",
        height: user.onboarding.heightCm || "",
        age: user.onboarding.age || "",
        gender: user.onboarding.sex || "",
        activityLevel: ""
      };

      setGoalData(prev => ({
        ...prev,
        userStats: prefilled
      }));

      // Auto-skip to step 2 if all basic info is filled (except activity level which user must select)
      if (prefilled.currentWeight && prefilled.height && prefilled.age && prefilled.gender) {
        toast.info("📋 Pre-filled your stats from profile! Just select your activity level.");
      }
    }
  }, [user]);

  const [calculatedPreview, setCalculatedPreview] = useState(null);

  const goalTypes = [
    {
      value: "fat_loss",
      label: "Fat Loss",
      description: "Reduce body fat while preserving muscle",
      color: "#ef4444"
    },
    {
      value: "muscle_gain",
      label: "Muscle Gain",
      description: "Build lean muscle mass systematically",
      color: "#10b981"
    },
    {
      value: "strength",
      label: "Strength",
      description: "Increase maximal force production",
      color: "#f59e0b"
    },
    {
      value: "endurance",
      label: "Endurance",
      description: "Improve cardiovascular capacity",
      color: "#3b82f6"
    }
  ];

  const activityLevels = [
    { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
    { value: "light", label: "Light", description: "Light exercise 1-3 days/week" },
    { value: "moderate", label: "Moderate", description: "Moderate exercise 3-5 days/week" },
    { value: "high", label: "High", description: "Heavy exercise 6-7 days/week" }
  ];

  const equipment = [
    { value: "bodyweight", label: "Bodyweight" },
    { value: "dumbbells", label: "Dumbbells" },
    { value: "barbell", label: "Barbell" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "kettlebells", label: "Kettlebells" },
    { value: "machines", label: "Machines" }
  ];

  // Calculate preview when user reaches final step
  const calculatePreview = () => {
    const { currentWeight, height, age, gender, activityLevel } = goalData.userStats;

    if (!currentWeight || !height || !age || !gender || !activityLevel) {
      return null;
    }

    // Simple BMR calculation (Mifflin-St Jeor)
    const baseBMR = 10 * currentWeight + 6.25 * height - 5 * age;
    const bmr = gender === 'male' ? baseBMR + 5 : baseBMR - 161;

    // TDEE
    const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
    const tdee = Math.round(bmr * activityFactors[activityLevel]);

    // Calorie target based on goal
    let dailyCalories = tdee;
    let expectedWeeklyChange = 0;

    if (goalData.type === 'fat_loss' && goalData.targetWeight) {
      const totalWeightLoss = currentWeight - goalData.targetWeight;
      const dailyDeficit = (totalWeightLoss * 7700) / (goalData.durationWeeks * 7);
      dailyCalories = Math.max(1200, Math.round(tdee - dailyDeficit));
      expectedWeeklyChange = -Math.round((dailyDeficit * 7) / 7700 * 10) / 10;
    } else if (goalData.type === 'muscle_gain') {
      dailyCalories = Math.round(tdee + 300);
      expectedWeeklyChange = 0.3;
    }

    const proteinTarget = Math.round(currentWeight * (goalData.type === 'fat_loss' ? 2.2 : 1.8));

    return {
      bmr: Math.round(bmr),
      tdee,
      dailyCalories,
      proteinTarget,
      expectedWeeklyChange
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await createSmartGoal(goalData);
      toast.success("Smart Goal created successfully!");
      navigate("/smart-goal");
    } catch (err) {
      console.error("Goal creation failed:", err);
      toast.error(err.response?.data?.message || "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-[#FE9A00]"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {/* Step 1: Current Stats */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-5xl font-bold mb-4">Tell us about yourself</h1>
              <p className="text-zinc-400 text-lg mb-12">
                We'll use this to calculate your personalized targets
              </p>

              <div className="space-y-6">
                {/* Current Weight */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={goalData.userStats.currentWeight}
                    onChange={(e) => setGoalData({
                      ...goalData,
                      userStats: { ...goalData.userStats, currentWeight: Number(e.target.value) }
                    })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-4 text-2xl font-bold focus:border-[#FE9A00] outline-none"
                    placeholder="70"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Height (cm)</label>
                  <input
                    type="number"
                    value={goalData.userStats.height}
                    onChange={(e) => setGoalData({
                      ...goalData,
                      userStats: { ...goalData.userStats, height: Number(e.target.value) }
                    })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-4 text-2xl font-bold focus:border-[#FE9A00] outline-none"
                    placeholder="175"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Age</label>
                    <input
                      type="number"
                      value={goalData.userStats.age}
                      onChange={(e) => setGoalData({
                        ...goalData,
                        userStats: { ...goalData.userStats, age: Number(e.target.value) }
                      })}
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-4 text-lg focus:border-[#FE9A00] outline-none"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Gender</label>
                    <select
                      value={goalData.userStats.gender}
                      onChange={(e) => setGoalData({
                        ...goalData,
                        userStats: { ...goalData.userStats, gender: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-4 text-lg focus:border-[#FE9A00] outline-none"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Activity Level</label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setGoalData({
                          ...goalData,
                          userStats: { ...goalData.userStats, activityLevel: level.value }
                        })}
                        className={`py-4 px-4 rounded-xl font-medium transition-all text-left ${goalData.userStats.activityLevel === level.value
                          ? "bg-[#FE9A00] text-black"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                          }`}
                      >
                        <div className="font-bold">{level.label}</div>
                        <div className="text-xs opacity-70">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  disabled={!goalData.userStats.currentWeight || !goalData.userStats.height || !goalData.userStats.age || !goalData.userStats.gender || !goalData.userStats.activityLevel}
                  className="w-full bg-[#FE9A00] text-black font-bold rounded-xl py-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Goal Type */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white mb-8 flex items-center gap-2"
              >
                ← Back
              </button>

              <h1 className="text-5xl font-bold mb-4">What's your primary goal?</h1>
              <p className="text-zinc-400 text-lg mb-12">
                Choose one focus. We'll optimize everything around it.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setGoalData({ ...goalData, type: type.value });
                      setStep(3);
                    }}
                    className="bg-zinc-900 border-2 border-zinc-800 hover:border-[#FE9A00] rounded-xl p-6 text-left transition-all"
                  >
                    <div className="text-3xl mb-3" style={{ color: type.color }}>●</div>
                    <h3 className="text-xl font-bold mb-2">{type.label}</h3>
                    <p className="text-zinc-400 text-sm">{type.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Goal Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep(2)}
                className="text-zinc-400 hover:text-white mb-8 flex items-center gap-2"
              >
                ← Back
              </button>

              <h1 className="text-5xl font-bold mb-4">Set your target</h1>
              <p className="text-zinc-400 text-lg mb-12">
                Be specific. This drives your entire training plan.
              </p>

              <div className="space-y-6">
                {/* Target Weight (for fat_loss/muscle_gain) */}
                {(goalData.type === 'fat_loss' || goalData.type === 'muscle_gain') && (
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={goalData.targetWeight}
                      onChange={(e) => setGoalData({ ...goalData, targetWeight: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-6 py-4 text-2xl font-bold focus:border-[#FE9A00] outline-none"
                      placeholder="65"
                    />
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">
                    Goal Duration: {goalData.durationWeeks} weeks
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={goalData.durationWeeks}
                    onChange={(e) => setGoalData({ ...goalData, durationWeeks: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>4 weeks</span>
                    <span>24 weeks</span>
                  </div>
                </div>

                {/* Workouts Per Week */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">
                    Workouts per week
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGoalData({ ...goalData, workoutsPerWeek: num })}
                        className={`py-4 rounded-xl font-bold transition-all ${goalData.workoutsPerWeek === num
                          ? "bg-[#FE9A00] text-black"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const preview = calculatePreview();
                    setCalculatedPreview(preview);
                    setStep(4);
                  }}
                  disabled={(goalData.type === 'fat_loss' || goalData.type === 'muscle_gain') && !goalData.targetWeight}
                  className="w-full bg-[#FE9A00] text-black font-bold rounded-xl py-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview & Confirm */}
          {step === 4 && calculatedPreview && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep(3)}
                className="text-zinc-400 hover:text-white mb-8 flex items-center gap-2"
              >
                ← Back
              </button>

              <h1 className="text-5xl font-bold mb-4">Your Personalized Plan</h1>
              <p className="text-zinc-400 text-lg mb-12">
                Based on your stats, here's what we calculated for you
              </p>

              {/* Calculated Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-zinc-900 rounded-xl p-6">
                  <div className="text-xs text-zinc-500 uppercase mb-2">BMR</div>
                  <div className="text-3xl font-bold text-[#FE9A00]">{calculatedPreview.bmr}</div>
                  <div className="text-xs text-zinc-500">kcal/day</div>
                </div>
                <div className="bg-zinc-900 rounded-xl p-6">
                  <div className="text-xs text-zinc-500 uppercase mb-2">TDEE</div>
                  <div className="text-3xl font-bold text-[#FE9A00]">{calculatedPreview.tdee}</div>
                  <div className="text-xs text-zinc-500">kcal/day</div>
                </div>
                <div className="bg-zinc-900 rounded-xl p-6">
                  <div className="text-xs text-zinc-500 uppercase mb-2">Daily Calories</div>
                  <div className="text-3xl font-bold text-[#10b981]">{calculatedPreview.dailyCalories}</div>
                  <div className="text-xs text-zinc-500">kcal/day</div>
                </div>
                <div className="bg-zinc-900 rounded-xl p-6">
                  <div className="text-xs text-zinc-500 uppercase mb-2">Daily Protein</div>
                  <div className="text-3xl font-bold text-[#10b981]">{calculatedPreview.proteinTarget}</div>
                  <div className="text-xs text-zinc-500">grams</div>
                </div>
              </div>

              {/* Expected Progress */}
              {calculatedPreview.expectedWeeklyChange !== 0 && (
                <div className="bg-zinc-900 rounded-xl p-6 mb-8">
                  <div className="text-sm text-zinc-400 mb-2">Expected Weekly Progress</div>
                  <div className="text-2xl font-bold">
                    {calculatedPreview.expectedWeeklyChange > 0 ? '+' : ''}
                    {calculatedPreview.expectedWeeklyChange} kg/week
                  </div>
                </div>
              )}

              {/* Goal Summary */}
              <div className="bg-zinc-900 rounded-xl p-6 mb-8">
                <div className="text-sm text-zinc-400 mb-2">Your Goal</div>
                <div className="text-xl font-bold">
                  {goalData.type === 'fat_loss' && `Lose ${goalData.userStats.currentWeight - goalData.targetWeight}kg`}
                  {goalData.type === 'muscle_gain' && `Gain ${goalData.targetWeight - goalData.userStats.currentWeight}kg`}
                  {goalData.type === 'strength' && 'Build Strength'}
                  {goalData.type === 'endurance' && 'Improve Endurance'}
                  {' '}in {goalData.durationWeeks} weeks, training {goalData.workoutsPerWeek}x/week
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#FE9A00] text-black font-bold rounded-xl py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create My Plan 🚀"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
