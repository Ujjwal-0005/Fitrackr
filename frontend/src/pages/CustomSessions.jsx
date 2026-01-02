import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { getCustomSessions, deleteCustomSession, startCustomSession } from "../api/customSessions";

// SVG Icon Component
const DumbbellIcon = ({ className = "w-16 h-16" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="9" width="3" height="6" rx="1" fill="#FE9A00" />
        <rect x="19" y="9" width="3" height="6" rx="1" fill="#FE9A00" />
        <rect x="5" y="10" width="2" height="4" fill="#FE9A00" />
        <rect x="17" y="10" width="2" height="4" fill="#FE9A00" />
        <rect x="7" y="11" width="10" height="2" rx="1" fill="#FE9A00" />
    </svg>
);

const CustomSessions = () => {
    const navigate = useNavigate();
    const [customSessions, setCustomSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForceStartModal, setShowForceStartModal] = useState(false);
    const [pendingSessionId, setPendingSessionId] = useState(null);
    const [activeSessionInfo, setActiveSessionInfo] = useState(null);

    useEffect(() => {
        loadCustomSessions();
    }, []);

    const loadCustomSessions = async () => {
        try {
            setLoading(true);
            const { sessions } = await getCustomSessions();
            setCustomSessions(sessions);
        } catch (err) {
            console.error("Failed to load custom sessions:", err);
            toast.error("Failed to load custom sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Delete this custom session? This action cannot be undone.")) return;

        try {
            await deleteCustomSession(id);
            toast.success("Session deleted successfully");
            loadCustomSessions();
        } catch (err) {
            toast.error("Failed to delete session");
        }
    };

    const handleStartSession = async (id, force = false) => {
        try {
            const { session, customSession } = await startCustomSession(id, force);
            toast.success("Workout started!");

            // Navigate with custom session data
            navigate("/workout-session-new", {
                state: {
                    sessionId: session._id,
                    customSession: customSession,
                    isCustomSession: true
                }
            });
        } catch (err) {
            const errorData = err.response?.data;

            if (errorData?.canForceStart) {
                // Show force-start modal
                setPendingSessionId(id);
                setActiveSessionInfo(errorData.activeSession);
                setShowForceStartModal(true);
            } else {
                toast.error(errorData?.message || "Failed to start session");
            }
        }
    };

    const handleForceStart = async () => {
        if (!pendingSessionId) {
            toast.error("No session selected");
            setShowForceStartModal(false);
            return;
        }

        try {
            setShowForceStartModal(false);
            const { session, customSession } = await startCustomSession(pendingSessionId, true);
            toast.success("Workout started!");

            // Navigate with custom session data
            navigate("/workout-session-new", {
                state: {
                    sessionId: session._id,
                    customSession: customSession,
                    isCustomSession: true
                }
            });

            setPendingSessionId(null);
            setActiveSessionInfo(null);
        } catch (err) {
            const errorData = err.response?.data;
            toast.error(errorData?.message || "Failed to start session");
            setPendingSessionId(null);
            setActiveSessionInfo(null);
        }
    };

    const handleCancelForceStart = () => {
        setShowForceStartModal(false);
        setPendingSessionId(null);
        setActiveSessionInfo(null);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute w-[600px] h-[600px] bg-[#FE9A00]/6 rounded-full blur-3xl"
                    style={{ animation: "float 30s ease-in-out infinite", top: '20%', right: '10%' }}
                />
                <div
                    className="absolute w-[500px] h-[500px] bg-[#FE9A00]/8 rounded-full blur-3xl"
                    style={{ animation: "float 25s ease-in-out infinite 5s", bottom: '20%', left: '15%' }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-6">
                            <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                CUSTOM WORKOUTS
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                            YOUR CUSTOM
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">
                                SESSIONS
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-[#a8adb3] max-w-3xl mx-auto font-light mb-8">
                            Build your own workouts. Train your way.
                        </p>

                        <motion.button
                            onClick={() => navigate("/workout-plans/custom")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold rounded-2xl hover:shadow-lg hover:shadow-[#FE9A00]/30 transition-all"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span className="text-2xl">+</span>
                            <span>CREATE NEW SESSION</span>
                        </motion.button>
                    </motion.div>

                    {/* Sessions Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-[#FE9A00]/20 border-t-[#FE9A00] rounded-full animate-spin"></div>
                            <p className="text-[#a8adb3] mt-4">Loading sessions...</p>
                        </div>
                    ) : customSessions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <DumbbellIcon className="w-24 h-24 mx-auto mb-6 opacity-40" />
                            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                No Custom Sessions Yet
                            </h3>
                            <p className="text-[#a8adb3] mb-8">
                                Create your first custom workout session to get started
                            </p>
                            <motion.button
                                onClick={() => navigate("/workout-plans/custom")}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-[#1a1d23]/60 backdrop-blur-sm border-2 border-dashed border-[#FE9A00]/30 text-[#FE9A00] font-bold rounded-2xl hover:bg-[#1a1d23]/80 hover:border-[#FE9A00]/50 transition-all"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Create Your First Session
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customSessions.map((session, index) => (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -8 }}
                                    className="group bg-[#1a1d23]/50 backdrop-blur-sm border border-[#FE9A00]/10 hover:border-[#FE9A00]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9A00]/10"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="text-xs font-bold text-[#FE9A00] mb-1 tracking-widest uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {session.focus}
                                            </div>
                                            <h4 className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {session.sessionName}
                                            </h4>
                                        </div>
                                        <DumbbellIcon className="w-10 h-10 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="space-y-2 mb-6 pb-6 border-b border-[#FE9A00]/10">
                                        {session.exercises.slice(0, 3).map((ex, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-[#a8adb3]">
                                                <div className="w-1 h-1 rounded-full bg-[#FE9A00]"></div>
                                                <span>{ex.name}</span>
                                                <span className="text-[#6b7280] ml-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {ex.sets}×{ex.reps || ex.duration + 's'}
                                                </span>
                                            </div>
                                        ))}
                                        {session.exercises.length > 3 && (
                                            <div className="text-xs text-[#6b7280] italic">
                                                +{session.exercises.length - 3} more exercises
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.button
                                            onClick={() => handleStartSession(session._id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#FE9A00]/30 transition-all text-sm"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Start
                                        </motion.button>
                                        {/* <button
                                            onClick={() => navigate(`/workout-plans/custom?sessionId=${session._id}`)}
                                            className="px-4 py-3 bg-[#1a1d23] text-white font-bold rounded-xl hover:bg-[#4b5563] transition-all text-sm"
                                        >
                                            Edit
                                        </button> */}
                                        <button
                                            onClick={() => handleDeleteSession(session._id)}
                                            className="px-4 py-3 bg-[#1a1d23] text-[#ef4444] font-bold rounded-xl hover:bg-[#4b5563] transition-all text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Force Start Modal */}
            <AnimatePresence>
                {showForceStartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                        onClick={handleCancelForceStart}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1d23] border border-[#FE9A00]/30 rounded-2xl p-8 max-w-md w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FE9A00]/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Active Session Detected
                                </h3>
                                <p className="text-[#a8adb3]">
                                    You have an active workout session in progress
                                </p>
                            </div>

                            {activeSessionInfo && (
                                <div className="bg-black/40 rounded-xl p-4 mb-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Session Type:</span>
                                        <span className="text-white font-semibold capitalize">{activeSessionInfo.sessionType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Started:</span>
                                        <span className="text-white font-semibold">
                                            {new Date(activeSessionInfo.startTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Exercises:</span>
                                        <span className="text-white font-semibold">{activeSessionInfo.exerciseCount}</span>
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#FE9A00]/10 border border-[#FE9A00]/30 rounded-xl p-4 mb-6">
                                <p className="text-sm text-[#FE9A00]">
                                    <strong>Warning:</strong> Starting a new session will abandon your current workout. All progress will be lost.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelForceStart}
                                    className="flex-1 px-6 py-3 bg-[#1a1d23] border border-[#FE9A00]/20 text-white font-bold rounded-xl hover:bg-[#4b5563] transition-all"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleForceStart}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Force Start
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
        </div>
    );
};

export default CustomSessions;
