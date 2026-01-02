import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { getAllPlans } from "../utils/workoutPlansLoader";
import { getCustomSessions, deleteCustomSession, startCustomSession } from "../api/customSessions";
import { getCompletedDays } from "../api/sessions";

// SVG Icon Components
const FireIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="#FF6B35" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14C12 14 9 16 9 18.5C9 20.43 10.57 22 12.5 22C14.43 22 16 20.43 16 18.5C16 16 12 14 12 14Z" fill="#FFB627" stroke="#FFB627" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 13C6 13 4 15 4 17C4 18.66 5.34 20 7 20C8.66 20 10 18.66 10 17C10 15 6 13 6 13Z" fill="#FF8C42" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MuscleIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2C14 2 16 3 16 5V7C16 7 18 8 18 10V14C18 14 20 15 20 17V20C20 21.1 19.1 22 18 22H16C14.9 22 14 21.1 14 20V17" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10 2C10 2 8 3 8 5V7C8 7 6 8 6 10V14C6 14 4 15 4 17V20C4 21.1 4.9 22 6 22H8C9.1 22 10 21.1 10 20V17" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="12" cy="12" r="3" fill="#FE9A00" />
    <path d="M12 9V15M9 12H15" stroke="#0f1115" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BoltIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RunIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="17" cy="4" r="2" fill="#FE9A00" />
    <path d="M15.5 7L13 9L11 11L9 13L7 15L5 17" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 9L15 11L17 13" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 11L9 15L7 19L5 21" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 11L17 15L19 19L21 21" stroke="#FE9A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DumbbellIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="3" height="6" rx="1" fill="#FE9A00" />
    <rect x="19" y="9" width="3" height="6" rx="1" fill="#FE9A00" />
    <rect x="5" y="10" width="2" height="4" fill="#FE9A00" />
    <rect x="17" y="10" width="2" height="4" fill="#FE9A00" />
    <rect x="7" y="11" width="10" height="2" rx="1" fill="#FE9A00" />
  </svg>
);

const WorkoutPlans = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [plans, setPlans] = useState([]);
  const [customSessions, setCustomSessions] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    setPlans(getAllPlans());
    loadCustomSessions();
  }, []);

  const loadCustomSessions = async () => {
    try {
      const data = await getCustomSessions();
      setCustomSessions(data?.sessions || []);
    } catch (err) {
      console.error("Failed to load custom sessions:", err);
      setCustomSessions([]);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Delete this custom session?")) return;

    try {
      await deleteCustomSession(id);
      toast.success("Session deleted");
      loadCustomSessions();
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  const handleStartSession = async (id) => {
    try {
      const { session } = await startCustomSession(id);
      toast.success("Workout started!");
      navigate("/workout-session-new", { state: { sessionId: session._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start session");
    }
  };

  // Particle background (reuse from Home)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(254, 154, 0, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goals = [
    {
      id: "fat_loss",
      name: "FAT LOSS",
      icon: <FireIcon />,
      philosophy: "Burn fat through intensity, consistency, and discipline.",
      traits: ["High-intensity training", "Metabolic conditioning", "Calorie-focused sessions"],
      description: "High-intensity workouts to burn maximum calories"
    },
    {
      id: "muscle_gain",
      name: "MUSCLE GAIN",
      icon: <MuscleIcon />,
      philosophy: "Build mass through progressive overload and volume.",
      traits: ["Hypertrophy focus", "4-6 day splits", "Controlled tempo"],
      description: "Progressive overload for hypertrophy and mass building"
    },
    {
      id: "strength",
      name: "STRENGTH",
      icon: <BoltIcon />,
      philosophy: "Develop raw power with heavy compound movements.",
      traits: ["Low-rep compounds", "Maximum intensity", "Progressive loading"],
      description: "Low-rep, high-weight training for maximum power"
    },
    {
      id: "endurance",
      name: "ENDURANCE",
      icon: <RunIcon />,
      philosophy: "Push limits with high-volume, stamina-building circuits.",
      traits: ["High-rep circuits", "Cardio emphasis", "Active recovery"],
      description: "High-rep circuit training for stamina and endurance"
    }
  ];

  const handleSelectPlan = (plan, dayNumber) => {
    // Find the specific day's data
    const dayData = plan.days.find(d => d.day === dayNumber);

    if (!dayData) {
      toast.error("Day not found in plan!");
      return;
    }

    toast.success(`Starting ${plan.name} - Day ${dayNumber}!`);
    navigate("/workout-session-new", {
      state: {
        planData: {
          ...plan,
          selectedDay: dayData,
          exercises: dayData.exercises
        },
        dayNumber: dayNumber
      }
    });
  };

  const selectedPlan = plans.find(p => p.goal === selectedGoal);

  // Fetch completed days when a plan is selected
  useEffect(() => {
    const fetchCompletedDays = async () => {
      if (selectedGoal && selectedPlan) {
        try {
          const response = await getCompletedDays(selectedPlan.goal, selectedPlan.level);
          setCompletedDays(response.data.completedDays || []);
          console.log('✅ Completed days:', response.data.completedDays);
        } catch (err) {
          console.error('Failed to fetch completed days:', err);
          setCompletedDays([]);
        }
      } else {
        setCompletedDays([]);
      }
    };

    fetchCompletedDays();
  }, [selectedGoal, selectedPlan]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Ambient Shapes */}
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

      {/* HERO SECTION - MISSION SELECTION */}
      {!selectedGoal && (
        <>
          <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-16 z-10">
            <div className="max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-8">
                  <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    TRAINING SELECTION
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                  CHOOSE YOUR
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">
                    TRAINING PATH
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-[#a8adb3] max-w-3xl mx-auto font-light mb-8">
                  Each goal is a different discipline. Commit with intent.
                </p>

                {/* Create Custom Session Button */}
                <motion.button
                  onClick={() => navigate("/workout-plans/custom")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a1d23]/60 backdrop-blur-sm border-2 border-dashed border-[#FE9A00]/40 text-[#FE9A00] font-bold rounded-2xl hover:bg-[#1a1d23]/80 hover:border-[#FE9A00]/60 transition-all"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="text-2xl">+</span>
                  <span>CREATE CUSTOM SESSION</span>
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* GOAL SECTIONS - ALTERNATING LAYOUT */}
          <div className="relative z-10">
            {goals.map((goal, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.section
                  key={goal.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`py-20 md:py-32 ${index % 2 === 0 ? 'bg-[#1a1d23]' : 'bg-[#0f1115]'}`}
                >
                  <div className="max-w-7xl mx-auto px-6">
                    <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}>

                      {/* Content Side */}
                      <div className={`space-y-6 ${!isEven ? 'md:order-2' : ''}`}>
                        {/* Large Icon */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="text-7xl mb-4"
                        >
                          {goal.icon}
                        </motion.div>

                        {/* Goal Badge */}
                        <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full">
                          <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                            {goal.name}
                          </span>
                        </div>

                        {/* Philosophy */}
                        <h2 className="text-4xl md:text-5xl font-black leading-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {goal.philosophy}
                        </h2>

                        {/* Training Traits */}
                        <div className="space-y-3 pt-4">
                          {goal.traits.map((trait, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FE9A00]"></div>
                              <span className="text-base text-[#a8adb3]">{trait}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Side */}
                      <div className={`flex justify-center md:${isEven ? 'justify-end' : 'justify-start'} ${!isEven ? 'md:order-1' : ''}`}>
                        <motion.button
                          onClick={() => setSelectedGoal(goal.id)}
                          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          className="group relative px-12 py-5 rounded-xl bg-gradient-to-r from-[#FE9A00] to-[#FFA500] font-bold text-black text-lg overflow-hidden"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Start {goal.name.split(' ')[0]} Program
                            <motion.svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </motion.svg>
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        </>
      )}

      {/* PLAN DETAILS - PREMIUM DESIGN */}
      {selectedGoal && selectedPlan && (
        <div className="relative z-10 min-h-screen pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6">

            {/* Back Button */}
            <motion.button
              onClick={() => setSelectedGoal(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -6 }}
              className="mb-8 px-6 py-3 bg-[#1a1d23]/60 backdrop-blur-sm border border-[#FE9A00]/20 text-[#FE9A00] rounded-xl hover:bg-[#1a1d23]/80 hover:border-[#FE9A00]/40 transition-all flex items-center gap-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span>←</span>
              <span className="font-semibold">Back to Goals</span>
            </motion.button>

            {/* Plan Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#1a1d23] to-[#2a2f38] border border-[#FE9A00]/30 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl shadow-[#FE9A00]/10"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="text-6xl mb-4">
                    {goals.find(g => g.id === selectedGoal)?.icon}
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {selectedPlan.name}
                  </h2>

                  <p className="text-xl text-[#a8adb3] mb-6 max-w-2xl">
                    {selectedPlan.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <div className="px-5 py-2 bg-black/40 border border-[#FE9A00]/20 rounded-full">
                      <span className="text-sm font-semibold text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {selectedPlan.duration}
                      </span>
                    </div>
                    <div className="px-5 py-2 bg-black/40 border border-[#FE9A00]/20 rounded-full">
                      <span className="text-sm font-semibold text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {selectedPlan.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Custom Sessions Section */}
            {customSessions.length > 0 && (
              <div className="mb-12">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-black text-white mb-6 flex items-center gap-3"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="w-1 h-8 bg-gradient-to-b from-[#FE9A00] to-[#FFA500] rounded-full"></span>
                  YOUR CUSTOM SESSIONS
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                              {ex.sets}×{ex.reps}
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
                        <button
                          onClick={() => navigate(`/workout-plans/custom?sessionId=${session._id}`)}
                          className="px-4 py-3 bg-[#1a1d23] text-white font-bold rounded-xl hover:bg-[#4b5563] transition-all text-sm"
                        >
                          Edit
                        </button>
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

                <motion.button
                  onClick={() => navigate("/workout-plans/custom")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-[#1a1d23]/60 backdrop-blur-sm border-2 border-dashed border-[#FE9A00]/30 text-[#FE9A00] font-bold rounded-2xl hover:bg-[#1a1d23]/80 hover:border-[#FE9A00]/50 transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="text-2xl">+</span>
                  CREATE NEW CUSTOM SESSION
                </motion.button>
              </div>
            )}

            {/* Training Days - Premium Grid */}
            <div className="mb-12">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-black text-white mb-6 flex items-center gap-3"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="w-1 h-8 bg-gradient-to-b from-[#FE9A00] to-[#FFA500] rounded-full"></span>
                TRAINING SCHEDULE
              </motion.h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedPlan.days.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8 }}
                    className="group bg-[#1a1d23]/50 backdrop-blur-sm border border-[#FE9A00]/10 hover:border-[#FE9A00]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9A00]/10"
                  >
                    {/* Day Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-xs font-bold mb-1 tracking-widest flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          <span className={completedDays.includes(day.day) ? 'text-[#00ff9c]' : 'text-[#FE9A00]'}>
                            DAY {day.day}
                          </span>
                          {completedDays.includes(day.day) && (
                            <span className="text-[#00ff9c] text-base">✓</span>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {day.focus}
                        </h4>
                      </div>
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        {day.targetMuscles.includes("cardio") ? <RunIcon className="w-10 h-10" /> : <MuscleIcon className="w-10 h-10" />}
                      </div>
                    </div>

                    {/* Exercise Preview */}
                    <div className="space-y-2 mb-6 pb-6 border-b border-[#FE9A00]/10">
                      {day.exercises.slice(0, 3).map((ex, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-[#a8adb3]">
                          <div className="w-1 h-1 rounded-full bg-[#FE9A00]"></div>
                          <span className="capitalize">
                            {ex.exerciseId.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[#6b7280] ml-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {ex.sets}×{ex.reps}
                          </span>
                        </div>
                      ))}
                      {day.exercises.length > 3 && (
                        <div className="text-xs text-[#6b7280] italic">
                          +{day.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>

                    {/* Start/Redo Button */}
                    <motion.button
                      onClick={() => handleSelectPlan(selectedPlan, day.day)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-6 py-3 font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${completedDays.includes(day.day)
                        ? 'bg-[#00ff9c]/10 border-2 border-[#00ff9c] text-[#00ff9c] hover:bg-[#00ff9c]/20 hover:shadow-[#00ff9c]/30'
                        : 'bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black hover:shadow-[#FE9A00]/30'
                        }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {completedDays.includes(day.day) ? (
                        <>
                          <span>✓</span>
                          Completed - Redo Day {day.day}
                        </>
                      ) : (
                        <>
                          Start Day {day.day}
                          <span>→</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Equipment Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1d23]/40 backdrop-blur-sm border border-[#FE9A00]/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <DumbbellIcon className="w-8 h-8" />
                EQUIPMENT REQUIRED
              </h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(
                  selectedPlan.days.flatMap(day =>
                    day.exercises.map(ex => ex.exerciseId)
                  )
                )).map((equipId, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="px-4 py-2 bg-black/40 border border-[#FE9A00]/20 rounded-full text-sm text-[#a8adb3] hover:border-[#FE9A00]/40 hover:text-white transition-all capitalize"
                  >
                    {equipId.replace(/_/g, ' ')}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

// PRIMARY BUTTON COMPONENT (matching Home)
const PrimaryButton = ({ children, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-[#0a0e13] font-bold text-base md:text-lg px-10 py-4 md:px-12 md:py-5 rounded-2xl shadow-xl hover:shadow-[#FE9A00]/40 transition-all duration-300 overflow-hidden group"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FE9A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default WorkoutPlans;
