import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getActiveGoalDetailed, recalculateGoalProgress } from "../api/smartGoals";
import Navbar from "../components/Navbar";
import ThreeBackground from "../components/ThreeBackground";

export default function SmartGoalDashboard() {
  const navigate = useNavigate();
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    loadGoalData();
  }, []);


  const loadGoalData = async () => {
    try {
      const data = await getActiveGoalDetailed();
      setGoalData(data);
    } catch (err) {
      console.error("Failed to load goal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!goalData?.goal?._id) return;
    setRecalculating(true);
    try {
      await recalculateGoalProgress(goalData.goal._id);
      await loadGoalData();
    } catch (err) {
      console.error("Failed to recalculate:", err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <div className="text-sm text-[#6b7280] uppercase tracking-wider">Loading...</div>
      </div>
    );
  }

  if (!goalData?.goal) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 text-white">No Active Goal</h1>
            <p className="text-[#9ca3af] mb-8">Create a goal to start tracking</p>
            <button
              onClick={() => navigate("/goal-setup")}
              className="bg-[#FE9A00] text-black px-6 py-3 font-medium text-sm hover:bg-[#00c4cc] transition-colors"
            >
              CREATE GOAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { goal, goalAlignmentScore, nutritionContribution, workoutContribution, expectedProgress, status } = goalData;

  const statusColors = {
    ahead: "#10b981",
    on_track: "#FE9A00",
    behind: "#f59e0b",
    stalled: "#ef4444",
  };

  const statusColor = statusColors[status] || statusColors.on_track;

  // Metric cards data
  const metricCards = [
    {
      label: "CALORIES",
      value: nutritionContribution?.avgDailyCalories || 0,
      target: nutritionContribution?.targetCalories || 0,
      unit: "kcal",
      delta: nutritionContribution?.avgDailyCalories - nutritionContribution?.targetCalories || 0,
    },
    {
      label: "PROTEIN",
      value: nutritionContribution?.avgDailyProtein || 0,
      target: nutritionContribution?.targetProtein || 0,
      unit: "g",
      delta: nutritionContribution?.avgDailyProtein - nutritionContribution?.targetProtein || 0,
    },
    {
      label: "WORKOUTS",
      value: workoutContribution?.sessionsCompleted || 0,
      target: workoutContribution?.sessionsPlanned || 0,
      unit: "",
      delta: (workoutContribution?.adherencePercent || 0) - 100,
    },
    {
      label: "PROGRESS",
      value: goalAlignmentScore || 0,
      target: 100,
      unit: "%",
      delta: (goalAlignmentScore || 0) - 70, // vs on_track threshold
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Three.js Animated Background */}
      <ThreeBackground />

      {/* Main Content - Full Width */}
      <div className="relative z-10 pt-32 pb-12">
        <div className="w-full px-8 max-w-[95vw] mx-auto">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 pb-6 border-b border-[#1a1d23]"
          >
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">
                  {goal.statement}
                </h1>
                <p className="text-sm text-[#9ca3af]">
                  {goal.type.replace('_', ' ')} • {expectedProgress?.daysRemaining || 0} days remaining
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: statusColor }}>
                    {status?.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Alignment Score</p>
                  <p className="text-3xl font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: statusColor }}>
                    {goalAlignmentScore}
                  </p>
                </div>
                <button
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  className="px-4 py-2 text-sm font-medium bg-[#1a1d23] text-white hover:bg-[#4b5563] transition-colors disabled:opacity-50"
                >
                  {recalculating ? "..." : "REFRESH"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Digital Progress Rails */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="mb-8 space-y-4"
          >
            {/* Expected Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Expected Progress</p>
                <p className="text-sm font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {Math.round(expectedProgress?.percentElapsed || 0)}%
                </p>
              </div>
              <div className="h-1 bg-[#1a1d23]">
                <div
                  className="h-full bg-[#6b7280] transition-all duration-500"
                  style={{ width: `${expectedProgress?.percentElapsed || 0}%` }}
                />
              </div>
            </div>

            {/* Actual Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Actual Progress</p>
                <p className="text-sm font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: statusColor }}>
                  {goalAlignmentScore}%
                </p>
              </div>
              <div className="h-1 bg-[#1a1d23]">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${goalAlignmentScore}%`, backgroundColor: statusColor }}
                />
              </div>
            </div>
          </motion.div>

          {/* Goal Breakdown Grid (4 Columns) */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="grid grid-cols-4 gap-px bg-[#4b5563] mb-8"
          >
            {metricCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 + idx * 0.02 }}
                className="bg-[#1a1d23] p-6 hover:bg-[#3d4450] transition-colors"
              >
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-semibold text-white tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-sm text-[#6b7280] font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {card.unit}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b7280]">vs {card.target}{card.unit}</span>
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: card.delta >= 0 ? '#10b981' : '#ef4444'
                    }}
                  >
                    {card.delta >= 0 ? '+' : ''}{Math.round(card.delta)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Impact Split Panel */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="grid grid-cols-2 gap-px bg-[#4b5563] mb-8"
          >
            {/* Training Impact */}
            <div className="bg-[#1a1d23] p-6">
              <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-6">
                Training Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Sessions</span>
                  <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {workoutContribution?.sessionsCompleted || 0}/{workoutContribution?.sessionsPlanned || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Adherence</span>
                  <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Math.round(workoutContribution?.adherencePercent || 0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Volume Score</span>
                  <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Math.round(workoutContribution?.volumeScore || 0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Overload Trend</span>
                  <span
                    className="text-lg font-semibold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: (workoutContribution?.progressiveOverloadTrend || 0) >= 0 ? '#10b981' : '#ef4444'
                    }}
                  >
                    {(workoutContribution?.progressiveOverloadTrend || 0) >= 0 ? '+' : ''}{Math.round(workoutContribution?.progressiveOverloadTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Nutrition Impact */}
            <div className="bg-[#1a1d23] p-6">
              <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-6">
                Nutrition Impact
              </h3>
              {nutritionContribution && (nutritionContribution.avgDailyCalories > 0 || nutritionContribution.avgDailyProtein > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9ca3af]">Avg Calories</span>
                    <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {nutritionContribution.avgDailyCalories || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9ca3af]">Target</span>
                    <span className="text-lg font-semibold text-[#6b7280] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {nutritionContribution.targetCalories || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9ca3af]">Protein</span>
                    <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {nutritionContribution.avgDailyProtein || 0}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9ca3af]">Compliance</span>
                    <span className="text-lg font-semibold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {Math.round(nutritionContribution.proteinCompliance || 0)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-sm text-[#6b7280] mb-2">No nutrition data yet</p>
                    <p className="text-xs text-[#4b5563]">Log meals to track nutrition impact</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Adaptation History Table */}
          {goal.adaptations && goal.adaptations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                Adaptation History
              </h3>
              <div className="border border-[#4b5563]">
                {/* Table Header */}
                <div className="bg-[#1a1d23] border-b border-[#4b5563] px-6 py-3 grid grid-cols-[1fr_2fr_3fr] gap-6">
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Date</p>
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Change</p>
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Reason</p>
                </div>

                {/* Table Rows */}
                {goal.adaptations.slice(-5).reverse().map((adaptation, index) => (
                  <div
                    key={index}
                    className="bg-[#0f1115] hover:bg-[#2a3038] border-b border-[#4b5563] last:border-b-0 px-6 py-4 grid grid-cols-[1fr_2fr_3fr] gap-6 transition-colors"
                  >
                    <p className="text-sm text-[#9ca3af]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(adaptation.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-white font-medium">
                      {adaptation.note}
                    </p>
                    <p className="text-sm text-[#9ca3af]">
                      {adaptation.reason}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
