import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const RestTimer = ({ duration, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = ((duration - timeLeft) / duration) * 100;

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50"
      >
        <div className="text-center">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#262626"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="#facc15"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ 
                  pathLength: progress / 100,
                  strokeDasharray: "753.98",
                  strokeDashoffset: 753.98 * (1 - progress / 100)
                }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                className="text-8xl font-mono font-bold text-amber-500"
                key={timeLeft}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {timeLeft}
              </motion.div>
              <div className="text-gray-500 text-lg mt-2 uppercase tracking-wider">
                Rest Time
              </div>
            </div>
          </div>

          {/* Skip Button */}
          <motion.button
            onClick={onSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors"
          >
            Skip Rest →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RestTimer;
