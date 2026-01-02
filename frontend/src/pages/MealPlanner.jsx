import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { generateMealPlan } from "../api/mealPlanner";
import MealPlanCard from "../components/MealPlanCard";
import ParticlesBackground from "../components/ParticlesBackground";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";

const MealPlanner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [mealPlan, setMealPlan] = useState(null);

    const [formData, setFormData] = useState({
        duration: "week",
        targetCalories: 2000,
        diet: "",
        exclude: [],
        cuisine: ""
    });

    // PDF Generation Function
    const generatePDF = () => {
        if (!mealPlan) return;

        const doc = new jsPDF();
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Title
        doc.setFontSize(24);
        doc.setTextColor(254, 154, 0); // Orange
        doc.text("Your Meal Plan", margin, yPosition);
        yPosition += 15;

        // Nutrition Summary
        if (mealPlan.nutrition && Object.keys(mealPlan.nutrition).length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text("Nutrition Summary", margin, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            Object.entries(mealPlan.nutrition).slice(0, 4).forEach(([key, value]) => {
                const displayValue = typeof value === 'number' ? Math.round(value) : value;
                doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${displayValue}`, margin + 5, yPosition);
                yPosition += 6;
            });
            yPosition += 10;
        }

        // Days and Meals
        mealPlan.days.forEach((day, dayIndex) => {
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Day Header
            doc.setFontSize(16);
            doc.setTextColor(254, 154, 0);
            doc.text(day.name || `Day ${day.day}`, margin, yPosition);
            yPosition += 10;

            // Meals
            day.meals.forEach((meal, mealIndex) => {
                // Check if we need a new page
                if (yPosition > 260) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text(`${meal.mealType || 'Meal'}: ${meal.title}`, margin + 5, yPosition);
                yPosition += 6;

                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);

                // Calories
                if (meal.calories) {
                    doc.text(`Calories: ${Math.round(meal.calories)} kcal`, margin + 10, yPosition);
                    yPosition += 5;
                }

                // Macros
                if (meal.protein || meal.carbs || meal.fat) {
                    const macros = [];
                    if (meal.protein) macros.push(`Protein: ${Math.round(meal.protein)}g`);
                    if (meal.carbs) macros.push(`Carbs: ${Math.round(meal.carbs)}g`);
                    if (meal.fat) macros.push(`Fat: ${Math.round(meal.fat)}g`);
                    doc.text(macros.join(' | '), margin + 10, yPosition);
                    yPosition += 5;
                }

                // Ingredients
                if (meal.ingredients && meal.ingredients.length > 0) {
                    doc.text("Ingredients:", margin + 10, yPosition);
                    yPosition += 5;
                    meal.ingredients.slice(0, 8).forEach(ingredient => {
                        if (yPosition > 280) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        const ingredientText = `• ${ingredient.name || ingredient.text || ingredient}`;
                        doc.text(ingredientText, margin + 15, yPosition);
                        yPosition += 4;
                    });
                    yPosition += 3;
                }

                // Recipe Link
                if (meal.url || meal.sourceUrl || meal.link) {
                    const recipeUrl = meal.url || meal.sourceUrl || meal.link;
                    doc.setFontSize(8);
                    doc.setTextColor(254, 154, 0); // Orange for link
                    doc.textWithLink("View Recipe →", margin + 10, yPosition, { url: recipeUrl });
                    yPosition += 5;
                }

                yPosition += 8;
            });

            yPosition += 5;
        });

        // Footer
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Generated by GymTrackr | Page ${i} of ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Download
        const fileName = `meal-plan-${formData.duration}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success("📄 Meal plan downloaded!");
    };

    const dietOptions = [
        { value: "", label: "None" },
        { value: "balanced", label: "Balanced" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "ketogenic", label: "Keto" },
        { value: "paleo", label: "Paleo" }
    ];

    const allergyOptions = [
        "dairy", "egg", "gluten", "peanut", "seafood", "shellfish", "soy", "tree nut", "wheat"
    ];

    const cuisineOptions = [
        { value: "", label: "None" },
        { value: "indian", label: "Indian" },
        { value: "italian", label: "Italian" },
        { value: "asian", label: "Asian" },
        { value: "mexican", label: "Mexican" },
        { value: "mediterranean", label: "Mediterranean" },
        { value: "american", label: "American" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "targetCalories" ? parseInt(value) || 0 : value
        }));
    };

    const handleAllergyToggle = (allergy) => {
        setFormData(prev => ({
            ...prev,
            exclude: prev.exclude.includes(allergy)
                ? prev.exclude.filter(a => a !== allergy)
                : [...prev.exclude, allergy]
        }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (formData.targetCalories < 1000 || formData.targetCalories > 5000) {
            toast.error("Calories must be between 1000 and 5000");
            return;
        }

        setLoading(true);
        try {
            const res = await generateMealPlan(formData);
            setMealPlan(res.data.mealPlan);
            toast.success("Meal plan generated successfully!");
        } catch (err) {
            console.error("Generate meal plan error:", err);
            toast.error(err.response?.data?.message || "Failed to generate meal plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#0f1115] relative" style={{ width: "100%", padding: "0 4vw" }}>
                <ParticlesBackground />

                <div className="relative z-10 py-12">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="text-5xl font-bold text-[#EEEEEE] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Meal Planner
                        </h1>
                        <p className="text-gray-400 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Generate personalized meal plans based on your preferences
                        </p>
                    </motion.div>

                    {/* Input Form - Unique Design */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleGenerate}
                        className="mb-12 rounded-3xl p-10 border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-[#FE9A00]/20"
                        style={{
                            background: "rgba(26, 29, 35, 0.6)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)"
                        }}
                    >
                        {/* Form Header */}
                        <div className="mb-8 pb-6 border-b border-white/10">
                            <h2 className="text-4xl font-bold text-[#EEEEEE] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Customize Your Plan
                            </h2>
                            <p className="text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Tailor your meal plan to match your lifestyle
                            </p>
                        </div>

                        {/* Main Grid - Duration & Calories */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Duration - Large Card */}
                            <div className="bg-gradient-to-br from-[#FE9A00]/10 to-transparent rounded-2xl p-6 border border-[#FE9A00]/20">
                                <label className="block text-xs uppercase tracking-wider text-[#FE9A00] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    Plan Duration
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, duration: "day" }))}
                                        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${formData.duration === "day"
                                            ? "bg-[#FE9A00] text-white shadow-lg shadow-[#FE9A00]/30"
                                            : "bg-[#0f1115]/60 text-gray-400 hover:bg-[#0f1115]/80"
                                            }`}
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        1 Day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, duration: "week" }))}
                                        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${formData.duration === "week"
                                            ? "bg-[#FE9A00] text-white shadow-lg shadow-[#FE9A00]/30"
                                            : "bg-[#0f1115]/60 text-gray-400 hover:bg-[#0f1115]/80"
                                            }`}
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        1 Week
                                    </button>
                                </div>
                            </div>

                            {/* Calories - Large Card */}
                            <div className="bg-gradient-to-br from-[#FE9A00]/10 to-transparent rounded-2xl p-6 border border-[#FE9A00]/20">
                                <label className="block text-xs uppercase tracking-wider text-[#FE9A00] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    Daily Calories
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="targetCalories"
                                        value={formData.targetCalories}
                                        onChange={handleChange}
                                        min="1000"
                                        max="5000"
                                        className="w-full bg-[#0f1115]/80 border-2 border-white/10 rounded-xl px-6 py-4 text-3xl font-bold text-[#EEEEEE] focus:border-[#FE9A00] focus:outline-none transition-all"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                        required
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        kcal
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    <span>Min: 1000</span>
                                    <span>Max: 5000</span>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#EEEEEE] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Dietary Preferences
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diet Type */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        Diet Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="diet"
                                            value={formData.diet}
                                            onChange={handleChange}
                                            className="w-full bg-[#0f1115]/80 border border-white/10 rounded-xl px-5 py-4 text-[#EEEEEE] appearance-none cursor-pointer focus:border-[#FE9A00] focus:outline-none transition-all"
                                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                                        >
                                            {dietOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Cuisine */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        Cuisine
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="cuisine"
                                            value={formData.cuisine}
                                            onChange={handleChange}
                                            className="w-full bg-[#0f1115]/80 border border-white/10 rounded-xl px-5 py-4 text-[#EEEEEE] appearance-none cursor-pointer focus:border-[#FE9A00] focus:outline-none transition-all"
                                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                                        >
                                            {cuisineOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Allergies Section */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#EEEEEE] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Exclude Allergies
                            </h3>
                            <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Select any ingredients you want to avoid
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {allergyOptions.map(allergy => (
                                    <button
                                        key={allergy}
                                        type="button"
                                        onClick={() => handleAllergyToggle(allergy)}
                                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${formData.exclude.includes(allergy)
                                            ? "bg-[#FE9A00] text-white shadow-lg shadow-[#FE9A00]/30 border-2 border-[#FE9A00]"
                                            : "bg-[#0f1115]/80 text-gray-400 border-2 border-white/10 hover:border-[#FE9A00]/50"
                                            }`}
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        {allergy}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-white font-bold py-5 rounded-xl hover:shadow-2xl hover:shadow-[#FE9A00]/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Your Plan...
                                </span>
                            ) : (
                                "Generate Meal Plan"
                            )}
                        </button>
                    </motion.form>

                    {/* Meal Plan Display */}
                    {mealPlan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Download PDF Button */}
                            <div className="flex justify-end">
                                <motion.button
                                    onClick={generatePDF}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] text-white font-bold rounded-xl shadow-lg shadow-[#EF4444]/20 hover:shadow-xl hover:shadow-[#EF4444]/30 transition-all"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </motion.button>
                            </div>
                            {/* Nutrition Summary */}
                            {mealPlan.nutrition && Object.keys(mealPlan.nutrition).length > 0 && (
                                <div
                                    className="rounded-2xl p-8 border border-white/10 shadow-2xl"
                                    style={{
                                        background: "rgba(26, 29, 35, 0.6)",
                                        backdropFilter: "blur(16px)",
                                        WebkitBackdropFilter: "blur(16px)"
                                    }}
                                >
                                    <h2 className="text-3xl font-bold text-[#EEEEEE] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Nutrition Summary
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(mealPlan.nutrition).slice(0, 4).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="bg-[#0f1115]/60 rounded-xl p-6 border border-white/5 text-center"
                                            >
                                                <p className="text-gray-400 text-sm capitalize mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{key}</p>
                                                <p className="text-3xl font-bold text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {typeof value === 'number' ? Math.round(value) : value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Days */}
                            {mealPlan.days.map((day) => (
                                <div
                                    key={day.day}
                                    className="rounded-2xl p-8 border border-white/10 shadow-2xl"
                                    style={{
                                        background: "rgba(26, 29, 35, 0.6)",
                                        backdropFilter: "blur(16px)",
                                        WebkitBackdropFilter: "blur(16px)"
                                    }}
                                >
                                    <h2 className="text-3xl font-bold text-[#EEEEEE] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {day.name || `Day ${day.day}`}
                                    </h2>
                                    <div className="grid gap-6" style={{
                                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"
                                    }}>
                                        {day.meals.map((meal, idx) => (
                                            <MealPlanCard key={`${meal.id}-${idx}`} meal={meal} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MealPlanner;
