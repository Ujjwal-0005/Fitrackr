import React from 'react';
import { motion } from 'framer-motion';

const PRCard = ({
    pr,
    index = 0,
    isHighlight = false,
    isNew = false,
    isTrending = false
}) => {
    const { exercise, value, unit, category, date } = pr;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={`relative group ${isHighlight
                ? 'bg-gradient-to-br from-[#FE9A00]/20 to-[#FFA500]/10'
                : 'bg-[#1a1d23]/40'
                } backdrop-blur-xl border ${isHighlight
                    ? 'border-[#FE9A00]/60'
                    : 'border-[#FE9A00]/20'
                } p-8 rounded-2xl hover:border-[#FE9A00]/60 transition-all duration-300 cursor-pointer overflow-hidden`}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FE9A00]/0 to-[#FFA500]/0 group-hover:from-[#FE9A00]/10 group-hover:to-[#FFA500]/5 transition-all duration-300 rounded-2xl" />

            {/* Badges */}
            <div className="relative z-10 flex gap-2 mb-4">
                {isHighlight && (
                    <span className="px-3 py-1 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black text-xs font-bold rounded-full flex items-center gap-1">
                        🥇 BEST
                    </span>
                )}
                {isNew && (
                    <span className="px-3 py-1 bg-[#FE9A00]/20 border border-[#FE9A00]/40 text-[#FE9A00] text-xs font-bold rounded-full flex items-center gap-1">
                        🆕 NEW
                    </span>
                )}
                {isTrending && (
                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold rounded-full flex items-center gap-1">
                        TRENDING
                    </span>
                )}
            </div>

            {/* Exercise Name */}
            <h3 className="relative z-10 text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#FE9A00] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {exercise}
            </h3>

            {/* Category */}
            <div className="relative z-10 mb-6">
                <span className="text-xs text-[#6b7280] uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {category || 'Strength'}
                </span>
            </div>

            {/* Value - Large and Prominent */}
            <div className="relative z-10 mb-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-6xl md:text-7xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {value}
                    </span>
                    <span className="text-3xl font-bold text-[#6b7280]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {unit}
                    </span>
                </div>
            </div>

            {/* Date */}
            <div className="relative z-10 flex items-center gap-2 text-sm text-[#a8adb3]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FE9A00]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );
};

export default PRCard;
