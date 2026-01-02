import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExerciseModal = ({ exercise, onClose }) => {
    if (!exercise) return null;

    // Get images sorted by order
    const images = exercise.media?.images?.sort((a, b) => a.order - b.order) || [];
    const setupImage = images.find(img => img.role === 'setup');
    const executionImage = images.find(img => img.role === 'execution');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1a1d23] border border-[#FE9A00]/40 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="float-right w-10 h-10 rounded-lg bg-[#0f1115] hover:bg-[#FE9A00]/20 transition flex items-center justify-center"
                    >
                        <span className="text-[#FE9A00] text-xl">✕</span>
                    </button>

                    {/* Exercise Name */}
                    <h2
                        className="text-3xl font-black mb-6 capitalize clear-both"
                        style={{ fontFamily: "'Outfit', sans-serif", color: "#EEEEEE" }}
                    >
                        {exercise.name}
                    </h2>

                    {/* Exercise Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {setupImage && (
                            <div>
                                <p className="text-xs font-bold text-[#FE9A00] mb-2 uppercase">Setup</p>
                                <div className="w-full h-64 bg-[#0f1115] rounded-xl overflow-hidden">
                                    <img
                                        src={setupImage.url}
                                        alt={`${exercise.name} - Setup`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                        {executionImage && (
                            <div>
                                <p className="text-xs font-bold text-[#FE9A00] mb-2 uppercase">Execution</p>
                                <div className="w-full h-64 bg-[#0f1115] rounded-xl overflow-hidden">
                                    <img
                                        src={executionImage.url}
                                        alt={`${exercise.name} - Execution`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                        <DetailRow label="Body Part" value={exercise.bodyPart} />
                        <DetailRow label="Target Muscle" value={exercise.target} />
                        <DetailRow label="Equipment" value={exercise.equipment} />

                        {exercise.instructions && exercise.instructions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-[#FE9A00] mb-3">Instructions</h3>
                                <ol className="list-decimal list-inside space-y-2">
                                    {exercise.instructions.map((instruction, index) => (
                                        <li key={index} className="text-[#a8adb3]">{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const DetailRow = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-bold text-[#FE9A00] mb-1">{label}</h3>
        <p className="text-[#a8adb3] capitalize">{value}</p>
    </div>
);

export default ExerciseModal;
