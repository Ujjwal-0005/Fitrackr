import { motion } from "framer-motion";

const MealPlanCard = ({ meal }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="rounded-xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-[#FE9A00]/20 transition-all duration-300 group"
            style={{
                background: "rgba(15, 17, 21, 0.7)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)"
            }}
        >
            {/* Meal Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={meal.image}
                    alt={meal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#FE9A00] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {meal.readyInMinutes} min
                </div>
            </div>

            {/* Meal Info */}
            <div className="p-5">
                <h3 className="text-lg font-semibold text-[#EEEEEE] mb-3 line-clamp-2 min-h-[3.5rem]">
                    {meal.title}
                </h3>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {meal.servings} servings
                    </span>
                    {meal.sourceUrl && (
                        <a
                            href={meal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FE9A00] hover:text-[#FFA500] font-medium transition-colors flex items-center gap-1"
                        >
                            View Recipe
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MealPlanCard;
