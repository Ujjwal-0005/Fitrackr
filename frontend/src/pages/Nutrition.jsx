import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyMeals, deleteMeal, logMealWithAI } from "../api/nutrition";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const canvasRef = useRef(null);

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  // Minimal ambient background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.15 + 0.05;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(254, 154, 0, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMeals = async () => {
    try {
      const res = await getMyMeals(selectedDate);
      setMeals(res.data.meals);
      setTotals(res.data.totals);
    } catch (err) {
      toast.error("Failed to load meals");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mealDescription.trim()) {
      toast.error("Please describe your meal");
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await logMealWithAI({
        meal: mealDescription,
        date: selectedDate,
        mealType: mealType
      });

      toast.success(`Meal logged! ${res.data.itemsAnalyzed} items analyzed`);
      setShowForm(false);
      setMealDescription("");
      setMealType("breakfast");

      if (res.data.dailyTotals) {
        setTotals(res.data.dailyTotals);
      }

      loadMeals();
    } catch (err) {
      console.error("Failed to log meal:", err);
      toast.error(err.response?.data?.message || "Failed to analyze meal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meal?")) return;
    try {
      await deleteMeal(id);
      toast.success("Meal deleted");
      loadMeals();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const metrics = [
    {
      label: "CALORIES",
      value: totals.calories,
      unit: "kcal",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
        </svg>
      )
    },
    {
      label: "PROTEIN",
      value: totals.protein,
      unit: "g",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      label: "CARBS",
      value: totals.carbs,
      unit: "g",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" strokeWidth="1.5" />
          <rect x="14" y="3" width="7" height="7" strokeWidth="1.5" />
          <rect x="3" y="14" width="7" height="7" strokeWidth="1.5" />
          <rect x="14" y="14" width="7" height="7" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      label: "FAT",
      value: totals.fat,
      unit: "g",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Minimal Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-30" />

      {/* Main Content - Full Width */}
      <div className="relative z-10 pt-32 pb-12">
        <div className="w-full px-8 max-w-[95vw] mx-auto">

          {/* Content Header (Below Navbar) */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 pb-6 border-b border-[#1a1d23]"
          >
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">
                  Nutrition
                </h1>
                <p className="text-sm text-[#9ca3af]">
                  Daily intake tracking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#1a1d23] border border-[#4b5563] px-4 py-2 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${showForm
                    ? "bg-[#1a1d23] text-[#9ca3af] border border-[#4b5563]"
                    : "bg-[#FE9A00] text-black hover:bg-[#00c4cc]"
                    }`}
                >
                  {showForm ? "CANCEL" : "LOG MEAL"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Digital Metrics Strip (Horizontal Grid) */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="grid grid-cols-4 gap-px bg-[#4b5563] mb-8"
          >
            {metrics.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.05 + idx * 0.02 }}
                className="bg-[#1a1d23] p-6 hover:bg-[#3d4450] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">
                    {metric.label}
                  </p>
                  <div className="text-[#4b5563]">
                    {metric.icon}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-white tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(metric.value).toFixed(1)}
                  </span>
                  <span className="text-sm text-[#6b7280] font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {metric.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Add Meal Form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-[#1a1d23] border border-[#4b5563] p-6">
                  <h3 className="text-base font-semibold text-white mb-4 uppercase tracking-wider text-xs">
                    AI Meal Analysis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                        Meal Type
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors"
                        disabled={isAnalyzing}
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#9ca3af] mb-2 uppercase tracking-wider">
                        Meal Description
                      </label>
                      <textarea
                        value={mealDescription}
                        onChange={(e) => setMealDescription(e.target.value)}
                        className="w-full bg-[#0f1115] border border-[#4b5563] px-4 py-3 text-sm text-white focus:border-[#FE9A00] focus:outline-none transition-colors resize-none"
                        placeholder="e.g., 2 eggs and 1 bowl rice, or Grilled chicken breast with quinoa"
                        rows="3"
                        required
                        disabled={isAnalyzing}
                      />
                      <p className="text-xs text-[#6b7280] mt-2">
                        Be specific for accurate analysis
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className={`w-full py-3 text-sm font-medium uppercase tracking-wider transition-colors ${isAnalyzing
                        ? "bg-[#4b5563] text-[#9ca3af] cursor-not-allowed"
                        : "bg-[#FE9A00] text-black hover:bg-[#00c4cc]"
                        }`}
                    >
                      {isAnalyzing ? "ANALYZING..." : "ANALYZE MEAL"}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Logged Meals - Table-Like Data Rows */}
          {meals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1a1d23] border border-[#4b5563] p-12 text-center"
            >
              <p className="text-sm text-[#6b7280] uppercase tracking-wider">
                No meals logged for this day
              </p>
            </motion.div>
          ) : (
            <div className="border border-[#4b5563]">
              {/* Table Header */}
              <div className="bg-[#1a1d23] border-b border-[#4b5563] px-6 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-6 items-center">
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium">Meal</p>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium text-right">Calories</p>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium text-right">Protein</p>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium text-right">Carbs</p>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.15em] font-medium text-right">Fat</p>
                <div className="w-8"></div>
              </div>

              {/* Table Rows */}
              {meals.map((meal, index) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group bg-[#0f1115] hover:bg-[#2a3038] border-b border-[#4b5563] last:border-b-0 px-6 py-4 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-6 items-center transition-colors"
                >
                  {/* Meal Name + Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[9px] uppercase font-medium tracking-wider bg-[#FE9A00]/10 text-[#FE9A00] border border-[#FE9A00]/20">
                        {meal.mealType}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white">
                      {meal.name}
                    </p>
                  </div>

                  {/* Metrics */}
                  <p className="text-lg font-semibold text-white tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(meal.calories).toFixed(1)}
                  </p>
                  <p className="text-lg font-semibold text-white tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(meal.protein).toFixed(1)}g
                  </p>
                  <p className="text-lg font-semibold text-white tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(meal.carbs).toFixed(1)}g
                  </p>
                  <p className="text-lg font-semibold text-white tabular-nums text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Number(meal.fat).toFixed(1)}g
                  </p>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(meal._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6b7280] hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
