import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const AnimatedStat = ({ value, label, suffix = "", prefix = "", color = "amber" }) => {
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001 
  });

  const display = useTransform(spring, (latest) => 
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const colorClasses = {
    amber: "text-amber-500",
    green: "text-green-500",
    blue: "text-blue-500",
    red: "text-red-500",
    purple: "text-purple-500"
  };

  return (
    <div className="text-center">
      <motion.div 
        className={`text-4xl md:text-6xl font-bold font-mono ${colorClasses[color]}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </motion.div>
      <div className="text-sm md:text-base text-gray-500 mt-2 uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  );
};

export default AnimatedStat;
