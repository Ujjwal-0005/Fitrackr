import { motion } from "framer-motion";
import { useState } from "react";

const AnimatedButton = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  icon = null,
  size = "default"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: "bg-[#FE9A00] text-[#0f1115] hover:bg-[#FF9F0A] border-2 border-[#FE9A00] hover:border-[#FF9F0A]",
    secondary: "bg-[#1a1d23] text-[#EEEEEE] border-2 border-[#FE9A00] hover:bg-[#FE9A00] hover:text-[#0f1115]",
    success: "bg-[#10b981] text-white hover:bg-[#059669] border-2 border-[#10b981]",
    danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] border-2 border-[#ef4444]",
    ghost: "bg-transparent border-2 border-[#FE9A00] text-[#FE9A00] hover:bg-[#FE9A00]/10"
  };

  const sizes = {
    hero: "px-12 py-6 text-xl min-h-[72px] font-extrabold tracking-tight",
    large: "px-10 py-5 text-lg min-h-[64px] font-extrabold tracking-tight",
    default: "px-8 py-4 text-base min-h-[56px] font-bold",
    small: "px-6 py-3 text-sm min-h-[48px] font-bold"
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: disabled ? 1 : size === 'hero' ? 1.03 : 1.02,
        y: disabled ? 0 : -2
      }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 20
      }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-2xl
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {icon && <span className={size === 'hero' ? 'text-2xl' : 'text-xl'}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
