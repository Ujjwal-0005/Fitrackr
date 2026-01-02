import React from 'react';
import { motion } from 'framer-motion';

const ExerciseCard = ({ exercise, onClick, index }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Get the first image (setup image)
    const thumbnailImage = exercise.media?.images?.find(img => img.role === 'setup')?.url ||
        exercise.media?.images?.[0]?.url;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.5 }}
            whileHover={{ y: -12, scale: 1.02 }}
            onClick={onClick}
            className="group relative bg-gradient-to-br from-[#1a1d23]/60 to-[#1a1d23]/40 backdrop-blur-2xl border border-[#FE9A00]/10 rounded-3xl overflow-hidden cursor-pointer hover:border-[#FE9A00]/60 transition-all duration-300 shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(0,173,181,0.3)]"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FE9A00]/0 via-[#FE9A00]/0 to-[#FE9A00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Exercise Image */}
            <div className="relative w-full h-56 bg-gradient-to-br from-[#0f1115] to-[#2a2f38] overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#FE9A00] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {thumbnailImage && (
                    <img
                        src={thumbnailImage}
                        alt={exercise.name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d23] via-transparent to-transparent opacity-60"></div>
            </div>

            {/* Exercise Info */}
            <div className="relative p-5">
                <h3
                    className="text-lg font-bold text-white mb-3 capitalize group-hover:text-[#FE9A00] transition-colors line-clamp-2 leading-tight"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {exercise.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#FE9A00]/20 to-[#FE9A00]/10 border border-[#FE9A00]/40 rounded-full text-xs font-semibold text-[#FE9A00] capitalize backdrop-blur-sm">
                        {exercise.bodyPart}
                    </span>
                    <span className="px-3 py-1.5 bg-[#2a2f38]/80 border border-[#FE9A00]/10 rounded-full text-xs font-medium text-[#a8adb3] capitalize backdrop-blur-sm">
                        {exercise.target}
                    </span>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#FE9A00]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};

export default ExerciseCard;
