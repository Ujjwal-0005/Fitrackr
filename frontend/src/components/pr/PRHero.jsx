import React from 'react';
import { motion } from 'framer-motion';

const PRHero = ({ totalPRs = 0, strongestLift = { exercise: 'N/A', value: 0, unit: 'kg' }, latestDate = null }) => {
    // Count-up animation hook
    const useCountUp = (end, duration = 2) => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
            let startTime;
            let animationFrame;

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

                setCount(Math.floor(progress * end));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };

            animationFrame = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(animationFrame);
        }, [end, duration]);

        return count;
    };

    const animatedTotal = useCountUp(totalPRs);
    const animatedWeight = useCountUp(strongestLift.value);

    return (
        <div className="relative z-10 pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-6"
                >
                    <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        HALL OF ACHIEVEMENTS
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-6xl md:text-7xl lg:text-8xl font-black mb-4 text-white"
                    style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
                >
                    PERSONAL RECORDS
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl md:text-2xl text-[#a8adb3] mb-12"
                >
                    Every rep. Every breakthrough.
                </motion.p>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
                >
                    {/* Total PRs */}
                    <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 p-6 rounded-2xl">
                        <p className="text-sm text-[#6b7280] uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Total Records
                        </p>
                        <p className="text-5xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {animatedTotal}
                        </p>
                    </div>

                    {/* Strongest Lift */}
                    <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 p-6 rounded-2xl">
                        <p className="text-sm text-[#6b7280] uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Strongest Lift
                        </p>
                        <p className="text-5xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {animatedWeight}
                            <span className="text-2xl ml-1">{strongestLift.unit}</span>
                        </p>
                        <p className="text-xs text-[#a8adb3] mt-2">{strongestLift.exercise}</p>
                    </div>

                    {/* Latest Record */}
                    <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 p-6 rounded-2xl">
                        <p className="text-sm text-[#6b7280] uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Latest Record
                        </p>
                        <p className="text-2xl font-bold text-[#FE9A00]">
                            {latestDate ? new Date(latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PRHero;
