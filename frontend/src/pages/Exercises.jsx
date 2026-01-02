import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import ExerciseModal from '../components/ExerciseModal';
import Pagination from '../components/Pagination';
import { useExercises } from '../hooks/useExercises';
import ThreeBackground from '../components/ThreeBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Exercises = () => {
    const {
        exercises,
        allExercises,
        filteredCount,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        bodyPartFilter,
        setBodyPartFilter,
        equipmentFilter,
        setEquipmentFilter,
        bodyParts,
        equipmentTypes,
        clearFilters,
        hasFilters,
        currentPage,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        hasNextPage,
        hasPreviousPage,
        startIndex,
        endIndex
    } = useExercises();

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [imageLoaded, setImageLoaded] = useState({});
    const cardsRef = useRef([]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1115]">
                <Navbar />
                <div className="container mx-auto px-6 py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Exercises</h2>
                        <p className="text-[#6b7280]">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // GSAP scroll animations for cards
    useEffect(() => {
        if (!loading && exercises.length > 0 && cardsRef.current.length > 0) {
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    gsap.fromTo(card,
                        {
                            opacity: 0,
                            y: 60,
                            scale: 0.9,
                            rotateX: -15
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotateX: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top bottom-=100',
                                end: 'top center',
                                toggleActions: 'play none none reverse',
                            },
                            delay: index * 0.05
                        }
                    );
                }
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [exercises, loading, currentPage]);

    return (
        <div className="min-h-screen bg-[#0f1115] relative overflow-hidden">
            {/* Three.js Animated Background */}
            <ThreeBackground />

            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-32 pb-20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-8"
                    >
                        <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            EXERCISE LIBRARY
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-6 leading-none"
                        style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
                    >
                        <span className="text-white">EXPLORE [TEST MARKER]</span>
                        <br />
                        <span className="bg-gradient-to-r from-[#FE9A00] to-[#FE9A00]/60 bg-clip-text text-transparent">
                            EXERCISES
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-[#a8adb3] font-light max-w-2xl mx-auto mb-12"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Move better. Train smarter.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex justify-center gap-8 mb-16"
                    >
                        <div className="text-center">
                            <div className="text-6xl font-black text-[#FE9A00] tracking-tight font-mono tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>1,324</div>
                            <div className="text-sm text-[#6b7280] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Exercises</div>
                        </div>
                        <div className="w-px bg-[#FE9A00]/20"></div>
                        <div className="text-center">
                            <div className="text-6xl font-black text-[#FE9A00] tracking-tight font-mono tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>15+</div>
                            <div className="text-sm text-[#6b7280] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Body Parts</div>
                        </div>
                        <div className="w-px bg-[#FE9A00]/20"></div>
                        <div className="text-center">
                            <div className="text-6xl font-black text-[#FE9A00] tracking-tight font-mono tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>20+</div>
                            <div className="text-sm text-[#6b7280] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Equipment Types</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-16 relative z-10">
                {/* Search and Filters */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 max-w-4xl mx-auto"
                    >
                        <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/10 rounded-2xl p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Search */}
                                <input
                                    type="text"
                                    placeholder="Search exercises..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-[#0f1115] border border-[#FE9A00]/20 rounded-xl px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#FE9A00] transition-colors"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                />

                                {/* Equipment Filter */}
                                <select
                                    value={equipmentFilter}
                                    onChange={(e) => setEquipmentFilter(e.target.value)}
                                    className="bg-[#0f1115] border border-[#FE9A00]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FE9A00] transition-colors capitalize"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {equipmentTypes.length > 0 ? (
                                        equipmentTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))
                                    ) : (
                                        <option value="all">All Equipment</option>
                                    )}
                                </select>
                            </div>

                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-lg text-[#FE9A00] text-sm font-medium hover:bg-[#FE9A00]/30 transition-colors"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Results Count */}
                {!loading && hasFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8 text-center"
                    >
                        <p className="text-[#a8adb3]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Found <span className="text-[#FE9A00] font-bold text-xl">{filteredCount}</span> exercises
                        </p>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#1a1d23]/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#FE9A00]/10"
                            >
                                <div className="w-full h-56 bg-gradient-to-br from-[#0f1115] to-[#2a2f38] animate-pulse"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-[#0f1115] rounded animate-pulse"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 w-20 bg-[#0f1115] rounded-full animate-pulse"></div>
                                        <div className="h-6 w-20 bg-[#0f1115] rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Exercise Grid */}
                {!loading && (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {exercises.map((exercise, index) => {
                                    const thumbnailImage = exercise.media?.images?.find(img => img.role === 'setup')?.url ||
                                        exercise.media?.images?.[0]?.url;

                                    return (
                                        <motion.div
                                            key={exercise.id}
                                            ref={el => cardsRef.current[index] = el}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => setSelectedExercise(exercise)}
                                            className="group relative bg-gradient-to-br from-[#1a1d23]/60 to-[#1a1d23]/40 backdrop-blur-2xl border border-[#FE9A00]/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#FE9A00]/60 transition-all duration-300 shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(254,154,0,0.4)]"
                                            style={{ perspective: '1000px' }}
                                        >
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#FE9A00]/0 via-[#FE9A00]/0 to-[#FE9A00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {/* Image */}
                                            <div className="relative w-full h-56 bg-gradient-to-br from-[#0f1115] to-[#2a2f38] overflow-hidden">
                                                {!imageLoaded[exercise.id] && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-10 h-10 border-4 border-[#FE9A00] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                                {thumbnailImage && (
                                                    <img
                                                        src={thumbnailImage}
                                                        alt={exercise.name}
                                                        loading="lazy"
                                                        onLoad={() => setImageLoaded(prev => ({ ...prev, [exercise.id]: true }))}
                                                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded[exercise.id] ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d23] via-transparent to-transparent opacity-60"></div>
                                            </div>

                                            {/* Content */}
                                            <div className="relative p-5">
                                                <h3
                                                    className="text-lg font-bold text-white mb-3 capitalize group-hover:text-[#FE9A00] transition-colors line-clamp-2 leading-tight"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    {exercise.name}
                                                </h3>

                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#FE9A00]/20 to-[#FE9A00]/10 border border-[#FE9A00]/40 rounded-full text-xs font-semibold text-[#FE9A00] capitalize">
                                                        {exercise.bodyPart}
                                                    </span>
                                                    <span className="px-3 py-1.5 bg-[#2a2f38]/80 border border-[#FE9A00]/10 rounded-full text-xs font-medium text-[#a8adb3] capitalize">
                                                        {exercise.target}
                                                    </span>
                                                </div>

                                                {/* Hover arrow */}
                                                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#FE9A00]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                                    <svg className="w-4 h-4 text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPrevious={goToPreviousPage}
                                    onNext={goToNextPage}
                                    onGoToPage={goToPage}
                                    hasPrevious={hasPreviousPage}
                                    hasNext={hasNextPage}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    totalItems={filteredCount}
                                />
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Exercise Detail Modal */}
            <AnimatePresence>
                {selectedExercise && (
                    <ExerciseModal
                        exercise={selectedExercise}
                        onClose={() => setSelectedExercise(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Exercises;
