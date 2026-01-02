import React, { useState, useEffect } from "react";
import { generatePlan, getPlans, deletePlan } from "../api/ai";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/Navbar";
import ThreeBackground from "../components/ThreeBackground";

const AIPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Form parameters
  const [formData, setFormData] = useState({
    goal: "general fitness",
    duration: "7",
    difficulty: "intermediate",
    focusArea: "full body"
  });

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      const res = await getPlans();
      setSavedPlans(res.data || []);
    } catch (err) {
      console.error("Failed to fetch saved plans:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await generatePlan(formData);
      setPlan(res.data.plan);
      await fetchSavedPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await deletePlan(planId);
      await fetchSavedPlans();
      if (selectedPlan && savedPlans[planId] === selectedPlan) {
        setSelectedPlan(null);
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const handleDownloadPDF = (planData) => {
    if (!planData) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(254, 154, 0);
    doc.text("AI WORKOUT PLAN", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(planData.summary || "Personalized Plan", 180);
    doc.text(summaryLines, 14, 32);

    let currentY = 32 + (summaryLines.length * 5) + 8;

    planData.days.forEach((day) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(254, 154, 0);
      doc.text(`${day.day} - ${day.focus}`, 14, currentY);
      currentY += 5;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Calories: ${day.calories}`, 14, currentY);
      currentY += 8;

      const tableData = day.exercises.map((ex) => [
        ex.name,
        ex.sets,
        ex.reps,
        ex.rest,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Exercise", "Sets", "Reps", "Rest"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [254, 154, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        }
      });

      currentY = doc.lastAutoTable.finalY + 12;
    });

    if (planData.weeklyTip) {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(254, 154, 0);
      doc.text("WEEKLY TIP", 14, currentY);
      currentY += 6;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const tipLines = doc.splitTextToSize(planData.weeklyTip, 180);
      doc.text(tipLines, 14, currentY);
    }

    doc.save("AI_Workout_Plan.pdf");
  };

  const displayPlan = selectedPlan || plan;

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <ThreeBackground />

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
                  AI Workout Planner
                </h1>
                <p className="text-sm text-[#9ca3af]">
                  Generate personalized training programs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("generate")}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "generate"
                      ? "bg-[#FE9A00] text-black"
                      : "bg-[#1a1d23] text-[#9ca3af] border border-[#4b5563]"
                    }`}
                >
                  GENERATE
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "saved"
                      ? "bg-[#FE9A00] text-black"
                      : "bg-[#1a1d23] text-[#9ca3af] border border-[#4b5563]"
                    }`}
                >
                  SAVED ({savedPlans.length})
                </button>
              </div>
            </div>
          </motion.div>

          {/* Generate Tab */}
          {activeTab === "generate" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Customization Form */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="bg-[#1a1d23] border border-[#4b5563] p-6"
              >
                <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-6">
                  Plan Parameters
                </h3>

                <div className="grid grid-cols-4 gap-6">
                  {/* Goal */}
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                      Primary Goal
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                    >
                      <option value="weight loss">Weight Loss</option>
                      <option value="muscle gain">Muscle Gain</option>
                      <option value="strength">Strength Training</option>
                      <option value="endurance">Endurance</option>
                      <option value="general fitness">General Fitness</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="athletic performance">Athletic Performance</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                    >
                      <option value="3">3 Days</option>
                      <option value="5">5 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="21">21 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Focus Area */}
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                      Focus Area
                    </label>
                    <select
                      name="focusArea"
                      value={formData.focusArea}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                    >
                      <option value="full body">Full Body</option>
                      <option value="upper body">Upper Body</option>
                      <option value="lower body">Lower Body</option>
                      <option value="core">Core</option>
                      <option value="cardio">Cardio</option>
                      <option value="arms">Arms</option>
                      <option value="legs">Legs</option>
                      <option value="back">Back</option>
                      <option value="chest">Chest</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${loading
                        ? "bg-[#4b5563] text-[#9ca3af] cursor-not-allowed"
                        : "bg-[#FE9A00] text-black hover:bg-[#00c4cc]"
                      }`}
                  >
                    {loading ? "GENERATING..." : "GENERATE PLAN"}
                  </button>

                  {displayPlan && (
                    <button
                      onClick={() => handleDownloadPDF(displayPlan)}
                      className="px-6 py-3 text-sm font-medium bg-[#1a1d23] text-white hover:bg-[#4b5563] transition-colors uppercase tracking-wider"
                    >
                      DOWNLOAD PDF
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#ef4444]/10 border border-[#ef4444]/50 p-4"
                  >
                    <p className="text-[#ef4444] text-sm uppercase tracking-wider">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plan Display */}
              {displayPlan && <PlanDisplay plan={displayPlan} />}
            </motion.div>
          )}

          {/* Saved Plans Tab */}
          {activeTab === "saved" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {savedPlans.length === 0 ? (
                <div className="bg-[#1a1d23] border border-[#4b5563] p-12 text-center">
                  <p className="text-sm text-[#6b7280] uppercase tracking-wider">
                    No saved plans yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-px bg-[#4b5563]">
                  {savedPlans.map((savedPlan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#1a1d23] p-6 hover:bg-[#3d4450] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPlan(savedPlan.aiPlan);
                        setActiveTab("generate");
                      }}
                    >
                      <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">
                        {savedPlan.title}
                      </h3>
                      <p className="text-xs text-[#9ca3af] mb-4 line-clamp-2">
                        {savedPlan.summary}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(savedPlan.aiPlan);
                          }}
                          className="flex-1 bg-[#0f1115] hover:bg-[#4b5563] text-white px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wider"
                        >
                          PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(index);
                          }}
                          className="flex-1 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wider"
                        >
                          DELETE
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedPlan && (
                <div className="mt-8">
                  <h2 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-4">
                    Selected Plan
                  </h2>
                  <PlanDisplay plan={selectedPlan} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Plan Display Component
const PlanDisplay = ({ plan }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Summary */}
      <div className="bg-[#1a1d23] border border-[#4b5563] p-6">
        <h3 className="text-xs text-[#6b7280] uppercase tracking-[0.15em] font-medium mb-3">
          Plan Summary
        </h3>
        <p className="text-sm text-white">
          {plan.summary}
        </p>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-2 gap-px bg-[#4b5563]">
        {plan.days.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1a1d23] p-6 hover:bg-[#3d4450] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
                  {day.day}
                </h3>
                <p className="text-xs text-[#9ca3af]">{day.focus}</p>
              </div>
              <span className="px-2 py-1 text-[9px] uppercase font-medium tracking-wider bg-[#FE9A00]/10 text-[#FE9A00] border border-[#FE9A00]/20">
                {day.calories}
              </span>
            </div>

            <div className="space-y-3">
              {day.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="bg-[#0f1115] p-3 border border-[#4b5563]/50"
                >
                  <p className="text-xs font-medium text-white mb-2">{ex.name}</p>
                  <div className="flex gap-4 text-[10px] text-[#6b7280] uppercase tracking-wider">
                    <span>SETS <span className="text-[#FE9A00] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ex.sets}</span></span>
                    <span>REPS <span className="text-[#FE9A00] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ex.reps}</span></span>
                    <span>REST <span className="text-[#FE9A00] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ex.rest}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Tip */}
      {plan.weeklyTip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#FE9A00]/10 border border-[#FE9A00]/30 p-6"
        >
          <h3 className="text-xs text-[#FE9A00] uppercase tracking-[0.15em] font-medium mb-3">
            Weekly Tip
          </h3>
          <p className="text-sm text-white">{plan.weeklyTip}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIPlanner;
