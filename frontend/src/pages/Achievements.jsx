import React, { useEffect, useState, useRef } from "react";
import { getMyAchievements, checkAchievements } from "../api/achievements";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

// All possible achievements with metadata
const ALL_ACHIEVEMENTS = [
  // Workout Milestones
  { type: "first_workout", title: "First Steps", description: "Complete your first workout", icon: "dumbbell", color: "#FE9A00", category: "Workouts" },
  { type: "10_workouts", title: "Getting Started", description: "Complete 10 workouts", icon: "fire", color: "#ff6b6b", category: "Workouts" },
  { type: "50_workouts", title: "Dedicated Athlete", description: "Complete 50 workouts", icon: "lightning", color: "#ffd93d", category: "Workouts" },
  { type: "100_workouts", title: "Century Club", description: "Complete 100 workouts", icon: "trophy", color: "#6bcf7f", category: "Workouts" },
  { type: "500_workouts", title: "Elite Warrior", description: "Complete 500 workouts", icon: "star", color: "#a78bfa", category: "Workouts" },

  // Personal Records
  { type: "first_pr", title: "Record Breaker", description: "Set your first PR", icon: "trendingUp", color: "#FE9A00", category: "Strength" },
  { type: "bench_100kg", title: "Bench Master", description: "Bench press 100kg", icon: "dumbbell", color: "#ff6b6b", category: "Strength" },
  { type: "squat_150kg", title: "Squat King", description: "Squat 150kg", icon: "dumbbell", color: "#ffd93d", category: "Strength" },
  { type: "deadlift_200kg", title: "Deadlift Legend", description: "Deadlift 200kg", icon: "dumbbell", color: "#6bcf7f", category: "Strength" },

  // Streaks
  { type: "7_day_streak", title: "Week Warrior", description: "7 day workout streak", icon: "fire", color: "#ff6b6b", category: "Consistency" },
  { type: "30_day_streak", title: "Monthly Master", description: "30 day workout streak", icon: "fire", color: "#ffd93d", category: "Consistency" },
  { type: "100_day_streak", title: "Unstoppable", description: "100 day workout streak", icon: "fire", color: "#a78bfa", category: "Consistency" },

  // Calories
  { type: "10k_calories", title: "Calorie Crusher", description: "Burn 10,000 calories", icon: "fire", color: "#ff6b6b", category: "Endurance" },
  { type: "50k_calories", title: "Inferno", description: "Burn 50,000 calories", icon: "fire", color: "#ffd93d", category: "Endurance" },
  { type: "100k_calories", title: "Furnace", description: "Burn 100,000 calories", icon: "fire", color: "#a78bfa", category: "Endurance" },
];

const AchievementsPage = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  // Particle Background
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
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
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
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(254, 154, 0, ${0.2 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
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

  const loadAchievements = async () => {
    try {
      const res = await getMyAchievements();
      setUnlockedAchievements(res.data || []);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  // Check if achievement is unlocked
  const isUnlocked = (type) => {
    return unlockedAchievements.some(a => a.type === type);
  };

  // Group achievements by category
  const categories = ["Workouts", "Strength", "Consistency", "Endurance"];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white relative overflow-hidden">
      <Navbar />

      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-[#FE9A00]/10 rounded-full blur-3xl"
          style={{ animation: "float 25s ease-in-out infinite", top: '10%', right: '10%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] bg-[#FE9A00]/8 rounded-full blur-3xl"
          style={{ animation: "float 30s ease-in-out infinite 5s", bottom: '10%', left: '10%' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-1 bg-gradient-to-r from-transparent via-[#FE9A00] to-transparent mx-auto mb-8"
            />

            <h1 className="text-6xl md:text-8xl font-black mb-4 text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
              ACHIEVEMENTS
            </h1>

            <p className="text-2xl md:text-3xl text-[#a8adb3] font-light italic mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your journey to greatness
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {unlockedAchievements.length}
                </div>
                <div className="text-sm text-[#6b7280] uppercase tracking-[0.2em]">Unlocked</div>
              </div>
              <div className="w-px bg-[#FE9A00]/20"></div>
              <div className="text-center">
                <div className="text-5xl font-black text-[#6b7280]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {ALL_ACHIEVEMENTS.length}
                </div>
                <div className="text-sm text-[#6b7280] uppercase tracking-[0.2em]">Total</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Grid by Category */}
      <section className="relative z-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                className="w-16 h-16 border-4 border-[#FE9A00] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            categories.map((category, catIndex) => {
              const categoryAchievements = ALL_ACHIEVEMENTS.filter(a => a.category === category);

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="mb-16"
                >
                  <h2 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {category}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryAchievements.map((achievement, index) => (
                      <AchievementCard
                        key={achievement.type}
                        achievement={achievement}
                        unlocked={isUnlocked(achievement.type)}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Float Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-20px);
          }
        }
      `}</style>
    </div>
  );
};

// Achievement Card Component
const AchievementCard = ({ achievement, unlocked, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: unlocked ? 1.05 : 1.02, y: -5 }}
      className={`relative bg-gradient-to-br rounded-2xl p-6 border overflow-hidden transition-all duration-300 ${unlocked
          ? 'from-[#1a1d23]/80 to-[#2a2f38]/80 border-[#FE9A00]/40 shadow-lg shadow-[#FE9A00]/20'
          : 'from-[#2a2f38]/40 to-[#0f1115]/40 border-[#1a1d23]/20 grayscale opacity-60'
        }`}
    >
      {/* Glow Effect for Unlocked */}
      {unlocked && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: achievement.color }}
        />
      )}

      {/* Lock Icon Overlay for Locked */}
      {!unlocked && (
        <div className="absolute top-4 right-4">
          <svg className="w-6 h-6 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className="relative z-10 mb-4">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center ${unlocked ? 'bg-gradient-to-br from-[#FE9A00]/20 to-[#FE9A00]/10' : 'bg-[#1a1d23]/20'
            }`}
          style={unlocked ? { borderColor: achievement.color, borderWidth: '2px' } : {}}
        >
          <Icon
            name={achievement.icon}
            className="w-8 h-8"
            style={unlocked ? { color: achievement.color } : { color: '#6b7280' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3
          className={`text-xl font-black mb-2 ${unlocked ? 'text-white' : 'text-[#6b7280]'}`}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {achievement.title}
        </h3>
        <p className={`text-sm ${unlocked ? 'text-[#a8adb3]' : 'text-[#6b7280]'}`}>
          {achievement.description}
        </p>
      </div>

      {/* Unlock Animation */}
      {unlocked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute bottom-4 right-4"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FE9A00] to-[#FFA500] flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AchievementsPage;
