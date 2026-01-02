import React from 'react';
import { motion } from 'framer-motion';

const ExerciseHero = () => {
    return (
        <div className="relative overflow-hidden mb-16">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1115]/50 to-[#0f1115] z-10"></div>

            {/* Hero Content */}
            <div className="relative z-20 py-20 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-[#FE9A00] to-white bg-clip-text text-transparent"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    Explore Exercises
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl text-[#a8adb3] font-light max-w-2xl mx-auto"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    Move better. Train smarter.
                </motion.p>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 flex justify-center gap-8"
                >
                    <div className="text-center">
                        <div className="text-3xl font-black text-[#FE9A00]">1,324</div>
                        <div className="text-sm text-[#6b7280]">Exercises</div>
                    </div>
                    <div className="w-px bg-[#FE9A00]/20"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-[#FE9A00]">15+</div>
                        <div className="text-sm text-[#6b7280]">Body Parts</div>
                    </div>
                    <div className="w-px bg-[#FE9A00]/20"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-[#FE9A00]">20+</div>
                        <div className="text-sm text-[#6b7280]">Equipment Types</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ExerciseHero;
