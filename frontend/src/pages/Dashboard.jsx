import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchOverview, fetchWeekly } from "../api/stats";
import { getWorkoutStreak } from "../api/streak";
import { getUserSessions } from "../api/sessions";
import WeeklyChart from "../components/WeeklyChart";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar-custom.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

const Dashboard = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const canvasRef = useRef(null);

    // Particle background
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
                const colors = [
                    { r: 254, g: 154, b: 0 },
                    { r: 255, g: 107, b: 53 },
                    { r: 239, g: 68, b: 68 }
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const particles = [];
        for (let i = 0; i < 50; i++) {
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

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [overviewRes, weeklyRes, sessionsRes, streakRes] = await Promise.all([
                    fetchOverview().catch(err => ({ data: null, error: err })),
                    fetchWeekly().catch(err => ({ data: [], error: err })),
                    getUserSessions().catch(err => ({ data: [], error: err })),
                    getWorkoutStreak().catch(err => ({ data: null, error: err }))
                ]);

                setOverview(overviewRes.data || {
                    totalWorkouts: 0,
                    totalCalories: 0,
                    avgDuration: 0
                });
                setWeekly(weeklyRes.data || []);

                // Transform sessions for calendar
                const events = (sessionsRes.data || []).map(s => ({
                    id: s._id,
                    title: `${s.calories || 0} kcal`,
                    start: new Date(s.date),
                    end: new Date(s.date),
                    allDay: true,
                    session: s
                }));
                setCalendarEvents(events);

                setStreak(streakRes.data || { currentStreak: 0, longestStreak: 0 });

                if (!overviewRes.error && !weeklyRes.error) {
                    toast.success("Analytics loaded successfully!");
                }
            } catch (err) {
                console.error("Dashboard load failed:", err);
                setError("Failed to load analytics data");
                toast.error("❌ Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]">
                <Navbar />
                <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
                    <div className="text-center mb-16">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 mx-auto mb-6 border-4 border-[#FE9A00] border-t-transparent rounded-full"
                        />
                        <p className="text-xl text-[#a8adb3]">Loading your performance data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]">
                <Navbar />
                <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 text-center">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h2 className="text-3xl font-bold text-white mb-4">Failed to Load Analytics</h2>
                    <p className="text-[#a8adb3] mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold rounded-xl hover:shadow-lg transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state (no workouts)
    const hasData = overview && overview.totalWorkouts > 0;

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] overflow-x-hidden">
            <Navbar />

            {/* Animated Canvas Background */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* Ambient Shapes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#FE9A00]/6 to-[#EF4444]/3 rounded-full blur-3xl"
                    style={{ animation: "float 25s ease-in-out infinite", top: '15%', right: '10%' }}
                />
                <div
                    className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#FE9A00]/8 to-[#EF4444]/4 rounded-full blur-3xl"
                    style={{ animation: "float 30s ease-in-out infinite 5s", bottom: '10%', left: '5%' }}
                />
            </div>

            {!hasData ? (
                /* EMPTY STATE */
                <EmptyState navigate={navigate} />
            ) : (
                <div className="relative z-10">
                    {/* HERO ANALYTICS HEADER */}
                    <HeroHeader overview={overview} streak={streak} />

                    {/* PERFORMANCE STORY SECTION */}
                    <PerformanceStory weekly={weekly} overview={overview} />

                    {/* WORKOUT CALENDAR */}
                    <WorkoutCalendar events={calendarEvents} selectedSession={selectedSession} setSelectedSession={setSelectedSession} />

                    {/* INSIGHTS & ACHIEVEMENTS - HORIZONTAL SCROLL */}
                    <InsightsCarousel overview={overview} streak={streak} />

                    {/* CTA FOOTER */}
                    <CTAFooter navigate={navigate} />
                </div>
            )}

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(15px); }
          66% { transform: translateY(15px) translateX(-15px); }
        }
      `}</style>
        </div>
    );
};

// EMPTY STATE
const EmptyState = ({ navigate }) => {
    return (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-2xl"
            >
                <div className="flex justify-center mb-8">
                    <Icon name="chart" className="w-20 h-20 text-[#FE9A00]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    No Workout Data Yet
                </h2>
                <p className="text-xl text-[#a8adb3] mb-8 max-w-md mx-auto">
                    Start training to see your performance metrics and analytics here.
                </p>
                <motion.button
                    onClick={() => navigate("/workout-plans")}
                    whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-12 py-5 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#EF4444]/20"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    Start Your First Workout →
                </motion.button>
            </motion.div>
        </div>
    );
};

// HERO ANALYTICS HEADER
const HeroHeader = ({ overview, streak }) => {
    return (
        <section className="relative pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "120px" }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-1 bg-gradient-to-r from-transparent via-[#FE9A00] via-[#FF6B35] to-transparent mx-auto mb-8"
                    />

                    <h1 className="text-6xl md:text-8xl font-black mb-4 text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
                        ANALYTICS
                    </h1>

                    <p className="text-2xl md:text-3xl text-[#a8adb3] font-light italic mb-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Your performance, decoded.
                    </p>
                </motion.div>

                {/* Inline KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
                    <InlineKPI value={overview.totalWorkouts || 0} label="Workouts" delay={0.3} />
                    <InlineKPI value={`${(overview.avgDuration || 0).toFixed(0)}m`} label="Avg Duration" delay={0.4} />
                    <InlineKPI value={overview.totalCalories || 0} label="Calories" delay={0.5} />
                    <InlineKPI
                        value={<div className="flex items-center justify-center gap-2"><span>{streak.currentStreak || 0}</span><Icon name="fire" className="w-8 h-8" /></div>}
                        label="Streak"
                        delay={0.6}
                    />
                </div>
            </div>
        </section>
    );
};

// Inline KPI Component
const InlineKPI = ({ value, label, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className="text-center"
        >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
            </div>
            <div className="text-xs md:text-sm text-[#6b7280] uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {label}
            </div>
        </motion.div>
    );
};

// PERFORMANCE STORY SECTION
const PerformanceStory = ({ weekly, overview }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const getNarrative = () => {
        if (!weekly || weekly.length === 0) return "Start training to build your performance story.";

        const totalCalories = weekly.reduce((sum, day) => sum + (day.calories || 0), 0);
        const avgCalories = Math.round(totalCalories / weekly.length);

        return `This week, you completed ${weekly.length} workout${weekly.length > 1 ? 's' : ''}, burning ${totalCalories.toLocaleString()} calories total. Averaging ${avgCalories} calories per session, you're building consistent momentum.`;
    };

    return (
        <section ref={ref} className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Performance Timeline
                    </h2>
                    <p className="text-lg md:text-xl text-[#a8adb3] mb-12 max-w-3xl italic">
                        {getNarrative()}
                    </p>

                    {/* Chart - Borderless, integrated */}
                    <div className="relative">
                        <WeeklyChart data={weekly} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Calendar localizer setup
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

// WORKOUT CALENDAR
const WorkoutCalendar = ({ events, selectedSession, setSelectedSession }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const eventStyleGetter = useCallback((event) => {
        const calories = event.session.calories || 0;
        let bg = "#393E46";
        if (calories > 500) bg = "#FE9A00";
        else if (calories > 300) bg = "#FFA500";
        else if (calories > 100) bg = "#FF9F0A";

        return {
            style: {
                backgroundColor: bg,
                color: "#000",
                borderRadius: "6px",
                border: "none",
                fontWeight: "600",
                fontSize: "12px"
            },
        };
    }, []);

    return (
        <section ref={ref} className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Workout Calendar
                    </h2>

                    <div className="bg-[#1a1d23] rounded-xl p-6 border border-[#FE9A00]/20">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            views={{ month: true, week: true, agenda: true }}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={(event) => setSelectedSession(event.session)}
                            popup
                        />
                    </div>

                    {/* Session Detail Modal */}
                    {selectedSession && (
                        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={() => setSelectedSession(null)}>
                            <motion.div
                                className="bg-[#1a1d23] p-6 rounded-lg shadow-2xl max-w-md w-full relative border border-[#FE9A00]/40"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="absolute top-2 right-2 text-[#FE9A00] hover:text-white text-2xl"
                                >
                                    ✖
                                </button>
                                <h2 className="text-xl font-semibold text-[#FE9A00] mb-2">
                                    Workout on {format(new Date(selectedSession.date), "MMMM do, yyyy")}
                                </h2>
                                <p className="text-[#FFA500] mb-2">
                                    🔥 Calories: {selectedSession.calories || "N/A"}
                                </p>
                                <p className="text-[#FFA500] mb-3">
                                    ⏱ Status: {selectedSession.status}
                                </p>
                                <ul className="text-sm text-[#EEEEEE] space-y-1 mb-4">
                                    {selectedSession.exercises?.map((ex, i) => (
                                        <li key={i}>
                                            • {ex.nameSnapshot || "Exercise"} — {ex.sets?.length || 0} sets
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

// INSIGHTS CAROUSEL
const InsightsCarousel = ({ overview, streak }) => {
    const insights = [];

    if (streak.currentStreak >= 7) {
        insights.push({
            icon: 'trophy',
            title: 'Consistency Champion',
            message: `${streak.currentStreak}-day streak! Keep the momentum going.`,
            color: '#ffe66d',
        });
    }

    if (overview.totalWorkouts >= 50) {
        insights.push({
            icon: 'badge',
            title: 'Workout Warrior',
            message: `${overview.totalWorkouts} workouts completed. You're crushing it!`,
            color: '#4ecdc4',
        });
    }

    if (overview.totalCalories >= 10000) {
        insights.push({
            icon: 'fire',
            title: 'Calorie Crusher',
            message: `${overview.totalCalories.toLocaleString()} calories burned total.`,
            color: '#ff6b6b',
        });
    }

    if (insights.length === 0) {
        insights.push({
            icon: 'dumbbell',
            title: 'Building Your Story',
            message: 'Complete more workouts to unlock achievements and insights.',
            color: '#FE9A00',
        });
    }

    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Insights & Achievements
                </h2>

                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[320px] md:min-w-[400px] bg-gradient-to-br from-[#1a1d23]/80 to-[#2a2f38]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl" style={{ background: insight.color }} />

                            <div className="relative z-10">
                                <div className="mb-4">
                                    <Icon name={insight.icon} className="w-12 h-12 text-[#FE9A00]" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {insight.title}
                                </h3>
                                <p className="text-[#a8adb3]">{insight.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// CTA FOOTER
const CTAFooter = ({ navigate }) => {
    return (
        <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <p className="text-2xl md:text-3xl text-[#a8adb3] italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        "Train today to improve tomorrow's analytics."
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            onClick={() => navigate("/workout-plans")}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] text-black font-black text-lg rounded-xl shadow-lg shadow-[#EF4444]/20 flex items-center justify-center gap-2"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <Icon name="fire" className="w-5 h-5" />
                            Start Workout
                        </motion.button>

                        <motion.button
                            onClick={() => navigate("/personal-records")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-white/10 hover:bg-white/15 text-white font-bold text-lg rounded-xl border-2 border-white/20 transition flex items-center justify-center gap-2"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <Icon name="chart" className="w-5 h-5" />
                            View Records
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Dashboard;
