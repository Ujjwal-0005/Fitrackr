import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
    return (
        <div className="fixed inset-0 bg-[#0f1115] z-50 flex items-center justify-center">
            {/* Animated particles in background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-[#FE9A00]"
                        style={{
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.4 + 0.1,
                            animation: `float ${Math.random() * 5 + 5}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main loader content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Barbell Animation */}
                <div className="relative mb-8">
                    {/* Left Weight Plate */}
                    <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-gradient-to-r from-[#FE9A00] to-[#FE9A00]/80 rounded-lg"
                        animate={{
                            y: [-10, 10, -10],
                            rotateZ: [-5, 5, -5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{ left: '-60px' }}
                    >
                        <div className="absolute inset-2 border-2 border-[#0f1115] rounded"></div>
                    </motion.div>

                    {/* Bar */}
                    <motion.div
                        className="w-40 h-3 bg-gradient-to-r from-[#1a1d23] via-[#6b7280] to-[#1a1d23] rounded-full relative"
                        animate={{
                            y: [-10, 10, -10],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {/* Grip marks */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 flex justify-around items-center">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-0.5 h-full bg-[#0f1115] opacity-50"></div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Weight Plate */}
                    <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-gradient-to-l from-[#FE9A00] to-[#FE9A00]/80 rounded-lg"
                        animate={{
                            y: [-10, 10, -10],
                            rotateZ: [5, -5, 5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{ right: '-60px' }}
                    >
                        <div className="absolute inset-2 border-2 border-[#0f1115] rounded"></div>
                    </motion.div>
                </div>

                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-16"
                >
                    <h2
                        className="text-2xl font-black text-white mb-2 tracking-tight"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        FITRACKR
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <motion.div
                            className="w-2 h-2 bg-[#FE9A00] rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-[#FE9A00] rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-[#FE9A00] rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                    </div>
                    <p
                        className="text-sm text-[#6b7280] mt-3 uppercase tracking-[0.2em]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Loading...
                    </p>
                </motion.div>
            </div>

            {/* Keyframes for particles */}
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
        </div>
    );
};

export default Preloader;
