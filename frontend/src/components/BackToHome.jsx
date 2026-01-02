import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BackToHome = () => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/home')}
            className="mb-4 md:mb-6 flex items-center gap-2 text-gray-400 hover:text-[#FE9A00] transition-colors group text-sm md:text-base"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <svg
                className="w-4 h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            <span className="hidden sm:inline">Return to Home</span>
            <span className="sm:hidden">Home</span>
        </motion.button>
    );
};

export default BackToHome;
