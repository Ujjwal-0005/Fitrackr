import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { startSession, addExercise, addSet, concludeSession } from "../api/sessions";
import { calculateSessionCalories } from "../utils/calorieCalculator";
import { useAuth } from "../context/AuthContext";
import { isBodyweightExercise } from "../utils/bodyweightExercises";
import Icon from "../components/Icon";

const WorkoutSessionNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { planData, dayNumber, customSession, sessionId: existingSessionId, isCustomSession } = location.state || {};
  const { user } = useAuth();

  // Extract plan goal to determine if this is a time-based workout (fat loss or endurance)
  const planGoal = planData?.goal || customSession?.planType || null;
  const isTimeBased = planGoal === 'fat_loss' || planGoal === 'endurance';

  // Session State
  const [sessionId, setSessionId] = useState(existingSessionId || null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const [completedSets, setCompletedSets] = useState({});
  const [restTimer, setRestTimer] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  const timerRef = useRef(null);
  const restRef = useRef(null);
  const canvasRef = useRef(null);

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

  // Initialize session from plan data OR custom session
  useEffect(() => {
    // Handle custom sessions
    if (isCustomSession && customSession) {
      console.log('🔵 Initializing custom session:', customSession);

      const initialExercises = customSession.exercises.map((ex, idx) => ({
        ...ex,
        id: `ex-${idx}`,
        exerciseId: ex.name, // Use name as exerciseId for custom sessions
        muscle: "Custom",
        equipment: "Custom",
        sets: ex.sets,
        reps: ex.reps,
        restSec: ex.rest || 60,
        setsData: Array(ex.sets).fill(null).map((_, setIdx) => ({
          id: `${idx}-${setIdx}`,
          setNumber: setIdx + 1,
          weight: ex.weight || 0,
          reps: ex.reps || 10,
          completed: false
        }))
      }));

      setExercises(initialExercises);
      setExpandedExercises(new Set([initialExercises[0]?.id]));

      // Auto-start the session since it's already created in backend
      if (existingSessionId) {
        setSessionId(existingSessionId);
        setSessionStarted(true);
        setSessionActive(true);
        toast.success("Session started! Let's crush it!");
      }
      return;
    }

    // Handle plan-based sessions
    if (!planData || !dayNumber) {
      toast.error("No workout plan selected");
      navigate("/workout-plans");
      return;
    }

    const dayData = planData.days.find(d => d.day === dayNumber);
    if (!dayData) {
      toast.error("Invalid day selected");
      navigate("/workout-plans");
      return;
    }

    const initialExercises = dayData.exercises.map((ex, idx) => ({
      ...ex,
      id: `ex-${idx}`,
      muscle: ex.muscle || "Unknown",
      equipment: ex.equipment || "Bodyweight",
      setsData: Array(ex.sets).fill(null).map((_, setIdx) => ({
        id: `${idx}-${setIdx}`,
        setNumber: setIdx + 1,
        weight: 0,
        duration: 30, // Default 30 seconds for time-based exercises
        reps: ex.reps || 10,
        completed: false
      }))
    }));

    setExercises(initialExercises);
    // Auto-expand first exercise
    setExpandedExercises(new Set([initialExercises[0]?.id]));
  }, [planData, dayNumber, customSession, isCustomSession, existingSessionId, navigate]);

  // Main Timer
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive]);

  // Rest Timer
  useEffect(() => {
    if (restTimer && restTimer.remaining > 0) {
      restRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remaining <= 1) {
            clearInterval(restRef.current);
            toast.success("Rest complete! Ready for next set");
            return null;
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    } else {
      clearInterval(restRef.current);
    }
    return () => clearInterval(restRef.current);
  }, [restTimer]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleStartSession = async () => {
    console.log('🔵 handleStartSession called:', {
      planData: planData?._id,
      dayNumber,
      exercisesCount: exercises.length
    });

    setSessionStarted(true);
    setSessionActive(true);

    // Start session in backend
    try {
      let newSessionId;

      try {
        const response = await startSession();
        newSessionId = response.data.session._id;
        console.log('✅ New session created:', newSessionId);
      } catch (sessionError) {
        // Check if there's already an active session
        if (sessionError.response?.status === 400 && sessionError.response?.data?.session?._id) {
          newSessionId = sessionError.response.data.session._id;
          console.log('⚠️ Using existing active session:', newSessionId);
          toast.info("Resuming existing session");
        } else {
          throw sessionError;
        }
      }

      setSessionId(newSessionId);

      // Add all exercises to the session
      for (const exercise of exercises) {
        await addExercise({
          sessionId: newSessionId,
          nameSnapshot: exercise.exerciseId.replace(/_/g, ' ').toUpperCase(),
          muscleSnapshot: exercise.muscle || 'Unknown'
        });
      }

      console.log('✅ All exercises added to session');
      toast.success("Session started! Let's crush it!");
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to start session. Continuing in offline mode.');
    }
  };

  const handleCompleteSet = (exerciseId, setId, weightOrDuration, reps) => {
    const key = `${exerciseId}-${setId}`;

    // For time-based workouts (fat loss/endurance), weightOrDuration is duration in seconds
    const weight = isTimeBased ? 0 : weightOrDuration;
    const duration = isTimeBased ? weightOrDuration : 0;

    console.log('🔵 handleCompleteSet called:', {
      exerciseId,
      setId,
      weight,
      duration,
      reps,
      sessionId,
      key,
      isTimeBased
    });

    setCompletedSets(prev => ({
      ...prev,
      [key]: { weight, duration, reps, timestamp: Date.now() }
    }));

    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.setsData.map(s =>
          s.id === setId ? { ...s, weight, duration, reps, completed: true } : s
        );
        return { ...ex, setsData: updatedSets };
      }
      return ex;
    }));

    // Log set to backend
    if (sessionId) {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        const nameSnapshot = exercise.exerciseId.replace(/_/g, ' ').toUpperCase();
        console.log('🟡 Logging set to backend:', { sessionId, exerciseId: nameSnapshot, weight, duration, reps });
        addSet({
          sessionId,
          exerciseId: nameSnapshot,
          reps: parseInt(reps) || 0,
          weightKg: parseFloat(weight) || 0,
          duration: parseInt(duration) || 0
        })
          .then(response => {
            console.log('🟢 Set logged successfully:', response);
          })
          .catch(error => {
            console.error("🔴 Failed to log set:", error);
            console.error("Error response:", error.response?.data);
          });
      } else {
        console.warn('⚠️ Exercise not found in exercises array');
      }
    } else {
      console.warn('⚠️ No sessionId - set not logged to backend');
    }

    // Start rest timer
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.restSec > 0) {
      setRestTimer({
        duration: exercise.restSec,
        remaining: exercise.restSec,
        exerciseName: exercise.exerciseId
      });
    }

    toast.success("Set completed!");
  };

  const handleAddSet = (exerciseId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newSetNumber = ex.setsData.length + 1;
        const newSet = {
          id: `${exerciseId}-${ex.setsData.length}`,
          setNumber: newSetNumber,
          weight: ex.setsData[ex.setsData.length - 1]?.weight || 0,
          reps: ex.reps,
          completed: false
        };
        return {
          ...ex,
          sets: ex.sets + 1,
          setsData: [...ex.setsData, newSet]
        };
      }
      return ex;
    }));
    toast.info("➕ Set added!");
  };

  const calculateStats = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completed = Object.keys(completedSets).length;
    const percentage = totalSets > 0 ? Math.round((completed / totalSets) * 100) : 0;

    const volume = Object.values(completedSets).reduce((sum, set) => {
      const weight = parseFloat(set.weight) || 0;
      const reps = parseInt(set.reps) || 0;
      return sum + (weight * reps);
    }, 0);

    // Calculate calories using proper formula
    const bodyWeightKg = user?.onboarding?.weightKg || 75; // Default to 75kg if not set
    const calories = calculateSessionCalories(exercises, bodyWeightKg);

    return {
      totalSets,
      completed,
      percentage,
      volume: Math.round(volume),
      calories
    };
  };

  const handleEndSession = () => {
    const stats = calculateStats();

    console.log('🔵 handleEndSession called:', {
      sessionId,
      stats,
      timer,
      exercisesCount: exercises.length,
      completedSetsCount: Object.keys(completedSets).length
    });

    if (stats.percentage < 100) {
      const confirmed = window.confirm(
        `You've completed ${stats.percentage}% of your workout. End session anyway?`
      );
      if (!confirmed) return;
    }

    setSessionActive(false);

    // Save session to backend
    if (sessionId) {
      const durationMinutes = Math.round(timer / 60);

      console.log('🟡 Calling concludeSession API:', {
        sessionId,
        calories: stats.calories,
        durationMin: durationMinutes,
        planGoal: planData?.goal,
        planLevel: planData?.level,
        dayNumber
      });

      concludeSession(sessionId, {
        calories: stats.calories,
        durationMin: durationMinutes,
        status: 'completed',
        planGoal: planData?.goal,
        planLevel: planData?.level,
        dayNumber: dayNumber
      })
        .then((response) => {
          console.log('🟢 Session save successful:', response);
          setSessionComplete(true);
          toast.success(`Session complete! ${stats.percentage}% done in ${formatTime(timer)}`);
        })
        .catch(error => {
          console.error("🔴 Failed to save session:", error);
          console.error("Error response:", error.response?.data);
          setSessionComplete(true);
          toast.warning("Session completed but failed to sync to server");
        });
    } else {
      console.warn('⚠️ No sessionId - session not started in backend');
      setSessionComplete(true);
      toast.success(`Session complete! ${stats.percentage}% done in ${formatTime(timer)}`);
    }
  };

  if (exercises.length === 0 && !isCustomSession) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <Icon name="clipboard" className="w-16 h-16 text-[#FE9A00]" />
          <h1 className="text-3xl font-bold text-[#FE9A00]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            No Workout Selected
          </h1>
          <button
            onClick={() => navigate("/workout-plans")}
            className="px-8 py-4 bg-linear-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold rounded-xl hover:shadow-lg transition"
          >
            Select Workout Plan
          </button>
        </motion.div>
      </div>
    );
  }

  const dayData = isCustomSession ? null : planData?.days.find(d => d.day === dayNumber);
  const stats = calculateStats();

  // Session Complete Screen
  if (sessionComplete) {
    return <SessionCompleteScreen stats={stats} timer={timer} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] relative overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Particle Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimer && <RestTimerOverlay restTimer={restTimer} setRestTimer={setRestTimer} />}
      </AnimatePresence>

      {/* Sticky Session Control Bar */}
      {sessionStarted && (
        <SessionControlBar
          timer={timer}
          dayNumber={dayNumber || "Custom"}
          dayFocus={isCustomSession ? customSession?.sessionName : dayData?.focus}
          stats={stats}
          isRunning={sessionActive}
        />
      )}

      {/* Main Content */}
      <div className={`${sessionStarted ? 'pt-40' : 'pt-4'} px-4 pb-32 relative z-10`}>

        {/* Pre-Session Screen */}
        {!sessionStarted && (
          <PreSessionScreen
            planData={planData || { name: customSession?.sessionName }}
            dayNumber={dayNumber || "Custom"}
            dayFocus={isCustomSession ? customSession?.focus : dayData?.focus}
            exercises={exercises}
            onStart={handleStartSession}
          />
        )}

        {/* Active Session */}
        {sessionStarted && (
          <div className="space-y-6">
            {/* Session Stats Overview */}
            <SessionStatsGrid stats={stats} timer={timer} />

            {/* Exercise Stack */}
            <div className="space-y-4">
              {exercises.map((exercise, idx) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={idx}
                  isExpanded={expandedExercises.has(exercise.id)}
                  onToggle={() => toggleExercise(exercise.id)}
                  onCompleteSet={handleCompleteSet}
                  onAddSet={handleAddSet}
                  isTimeBased={isTimeBased}
                />
              ))}
            </div>

            {/* Sticky Bottom Controls */}
            <StickySessionControls
              sessionActive={sessionActive}
              onPause={() => setSessionActive(false)}
              onResume={() => setSessionActive(true)}
              onEnd={handleEndSession}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ========== SUB-COMPONENTS ==========

// Session Control Bar (Sticky Top)
const SessionControlBar = ({ timer, dayNumber, dayFocus, stats, isRunning }) => {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          {/* Timer */}
          <div>
            <div className="text-xs text-[#a8adb3] uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              SESSION TIME
            </div>
            <div className="text-3xl md:text-4xl font-black text-white flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {timer > 0 ? formatTime(timer) : "00:00:00"}
              {isRunning && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-[#00ff9c]"
                />
              )}
            </div>
          </div>

          {/* Day Info */}
          <div className="text-right">
            <div className="text-xs text-[#a8adb3] uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              DAY {dayNumber}
            </div>
            <div className="text-lg md:text-xl font-bold text-[#FE9A00]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {dayFocus}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute h-full bg-linear-to-r from-[#FE9A00] via-[#FFA500] to-[#00ff9c] rounded-full"
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#a8adb3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.percentage}% COMPLETE
          </span>
          <span className="text-xs text-[#a8adb3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.completed} / {stats.totalSets} SETS
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Pre-Session Screen
const PreSessionScreen = ({ planData, dayNumber, dayFocus, exercises, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-12 py-8"
    >
      {/* Hero */}
      <div className="space-y-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-4"
        >
          <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            WORKOUT SESSION
          </span>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white"
          style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
        >
          {planData.name}
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl text-transparent bg-clip-text bg-linear-to-r from-[#FE9A00] to-[#FFA500]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Day {dayNumber}: {dayFocus}
        </motion.p>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        <PremiumStatCard
          value={exercises.length}
          label="Exercises"
          color="#FE9A00"
          icon={<Icon name="target" className="w-8 h-8" />}
          delay={0.45}
        />
        <PremiumStatCard
          value={exercises.reduce((sum, ex) => sum + ex.sets, 0)}
          label="Total Sets"
          color="#00ff9c"
          icon={<Icon name="muscle" className="w-8 h-8" />}
          delay={0.5}
        />
        <PremiumStatCard
          value={Math.round(exercises.reduce((sum, ex) => sum + (ex.sets * ex.restSec), 0) / 60)}
          label="Minutes"
          color="#fbbf24"
          icon="⏱️"
          delay={0.55}
        />
      </motion.div>

      {/* Exercise Preview List */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto space-y-3"
      >
        <h3 className="text-xl font-bold text-[#a8adb3] uppercase tracking-wider mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Today's Plan
        </h3>
        {exercises.map((ex, idx) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + idx * 0.05 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-[#FE9A00] transition-all"
          >
            <div className="text-left">
              <div className="font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {ex.exerciseId.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-sm text-[#a8adb3]">
                {ex.sets} sets × {ex.reps} reps
              </div>
            </div>
            <div className="text-[#FE9A00] font-mono">#{idx + 1}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center py-8"
      >
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(254,154,0,0.5)" }}
          whileTap={{ scale: 0.98 }}
          className="px-16 py-6 bg-linear-to-r from-[#FE9A00] to-[#FFA500] text-black font-black text-xl rounded-xl shadow-2xl"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          START WORKOUT
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Session Stats Grid
const SessionStatsGrid = ({ stats, timer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <StatCard value={stats.calories} label="Calories" color="#00ff9c" icon={<Icon name="fire" className="w-8 h-8" />} />
      <StatCard value={stats.volume} label="Volume (kg)" color="#FE9A00" icon={<Icon name="muscle" className="w-8 h-8" />} />
      <StatCard value={formatTime(timer)} label="Duration" color="#fbbf24" icon="⏱️" />
    </motion.div>
  );
};

const StatCard = ({ value, label, color, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-linear-to-br from-black/60 to-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}25, transparent 70%)` }}
      />
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="relative">
        <div className="text-4xl mb-3 filter drop-shadow-lg">{icon}</div>
        <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color,
            textShadow: `0 0 20px ${color}40`
          }}>
          {value}
        </div>
        <div className="text-xs text-[#a8adb3] uppercase tracking-[0.15em] font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
};

const PremiumStatCard = ({ value, label, color, icon, delay }) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/10 to-white/5 blur-xl group-hover:blur-2xl transition-all duration-500" />
      <div className="relative bg-linear-to-br from-[#2d3139]/90 to-[#1a1d23]/90 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-8 overflow-hidden shadow-2xl">
        <motion.div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
          <motion.div
            className="text-5xl mb-4 filter drop-shadow-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            {icon}
          </motion.div>
          <motion.div
            className="text-6xl md:text-7xl font-black mb-3 tracking-tighter leading-none"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color,
              textShadow: `0 0 30px ${color}60, 0 0 60px ${color}30`
            }}
            whileHover={{ scale: 1.1 }}
          >
            {value}
          </motion.div>
          <div className="text-xs text-[#EEEEEE]/70 uppercase tracking-[0.2em] font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Exercise Card
const ExerciseCard = ({ exercise, index, isExpanded, onToggle, onCompleteSet, onAddSet, isTimeBased }) => {
  const completedCount = exercise.setsData.filter(s => s.completed).length;
  const allCompleted = completedCount === exercise.sets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-black/40 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all ${allCompleted ? 'border-[#00ff9c]' : 'border-white/10 hover:border-[#FE9A00]'
        }`}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-6 cursor-pointer select-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{allCompleted ? <Icon name="checkCircle" className="w-6 h-6 text-[#00ff9c]" /> : <Icon name="muscle" className="w-6 h-6 text-[#FE9A00]" />}</div>
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {exercise.exerciseId.replace(/_/g, ' ').toUpperCase()}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[#a8adb3]">
              <span className="flex items-center gap-1"><Icon name="target" className="w-4 h-4" /> {exercise.muscle}</span>
              <span className="flex items-center gap-1"><Icon name="dumbbell" className="w-4 h-4" /> {exercise.equipment}</span>
              <span className="flex items-center gap-1"><Icon name="chart" className="w-4 h-4" /> {exercise.sets} × {exercise.reps}</span>
              <span>⏱️ {exercise.restSec}s rest</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-black ${allCompleted ? 'text-[#00ff9c]' : 'text-[#FE9A00]'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {completedCount}/{exercise.sets}
              </div>
              <div className="text-xs text-[#a8adb3]">SETS</div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-2xl text-[#FE9A00]"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sets (Collapsible) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 space-y-3">
              {exercise.setsData.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  targetReps={exercise.reps}
                  onComplete={(weight, reps) => onCompleteSet(exercise.id, set.id, weight, reps)}
                  isTimeBased={isTimeBased}
                />
              ))}

              {/* Add Set Button */}
              <motion.button
                onClick={() => onAddSet(exercise.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-[#FE9A00] rounded-xl text-[#FE9A00] font-bold transition flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span>Add Set</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Set Row - Supports both weight-based and time-based exercises
const SetRow = ({ set, targetReps, onComplete, exerciseName, isTimeBased }) => {
  // For time-based workouts (fat loss/endurance), always use time-based inputs
  // For other workouts, check if it's a bodyweight exercise
  const useTimeBased = isTimeBased || (exerciseName ? isBodyweightExercise(exerciseName) : false);

  const [weight, setWeight] = useState(set.weight || 0);
  const [duration, setDuration] = useState(set.duration || 30);
  const [reps, setReps] = useState(set.reps || targetReps);

  const adjustWeight = (delta) => setWeight(prev => Math.max(0, prev + delta));
  const adjustDuration = (delta) => setDuration(prev => Math.max(5, prev + delta));
  const adjustReps = (delta) => setReps(prev => Math.max(1, prev + delta));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl p-4 border-2 transition-all ${set.completed
        ? 'bg-[#00ff9c]/10 border-[#00ff9c]'
        : 'bg-white/5 border-white/10 hover:border-[#FE9A00]'
        }`}
    >
      <div className="flex items-center gap-4">
        {/* Set Number */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${set.completed ? 'bg-[#00ff9c] text-black' : 'bg-[#FE9A00] text-black'
          }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {set.setNumber}
        </div>

        {/* Inputs */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#a8adb3] uppercase tracking-wider mb-1 block">
              {useTimeBased ? 'Time (sec)' : 'Weight (kg)'}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => useTimeBased ? adjustDuration(-5) : adjustWeight(-2.5)}
                disabled={set.completed}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-30 transition"
              >
                -
              </button>
              <input
                type="number"
                value={useTimeBased ? duration : weight}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  useTimeBased ? setDuration(val) : setWeight(val);
                }}
                disabled={set.completed}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center font-bold text-white focus:border-[#FE9A00] focus:outline-none disabled:opacity-50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                onClick={() => useTimeBased ? adjustDuration(5) : adjustWeight(2.5)}
                disabled={set.completed}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-30 transition"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#a8adb3] uppercase tracking-wider mb-1 block">Reps</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustReps(-1)}
                disabled={set.completed}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-30 transition"
              >
                -
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={set.completed}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center font-bold text-white focus:border-[#FE9A00] focus:outline-none disabled:opacity-50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                onClick={() => adjustReps(1)}
                disabled={set.completed}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-30 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        {set.completed ? (
          <div className="px-6 py-3 bg-[#00ff9c] text-black font-bold rounded-xl">
            ✓ Done
          </div>
        ) : (
          <motion.button
            onClick={() => onComplete(useTimeBased ? duration : weight, reps)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#FE9A00] hover:bg-[#FFA500] text-black font-bold rounded-xl transition shadow-lg"
          >
            Complete
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Rest Timer Overlay
const RestTimerOverlay = ({ restTimer, setRestTimer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
    >
      <div className="bg-linear-to-br from-[#fbbf24] to-[#f59e0b] rounded-2xl p-6 shadow-2xl border-2 border-[#fbbf24]">
        <div className="text-center space-y-4">
          <div className="text-sm font-bold text-black/70 uppercase tracking-wider">
            REST TIME
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-7xl font-black text-black"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {restTimer.remaining}s
          </motion.div>
          <div className="text-sm text-black/70">
            {restTimer.exerciseName?.replace(/_/g, ' ')}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setRestTimer(prev => ({ ...prev, remaining: prev.remaining + 15 }))}
              className="flex-1 px-4 py-2 bg-black/20 hover:bg-black/30 text-black font-bold rounded-lg transition"
            >
              +15s
            </button>
            <button
              onClick={() => setRestTimer(null)}
              className="flex-1 px-4 py-2 bg-black/20 hover:bg-black/30 text-black font-bold rounded-lg transition"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Sticky Session Controls
const StickySessionControls = ({ sessionActive, onPause, onResume, onEnd }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
    >
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex gap-3">
          {sessionActive ? (
            <motion.button
              onClick={onPause}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold rounded-xl transition text-lg"
            >
              ⏸ Pause
            </motion.button>
          ) : (
            <motion.button
              onClick={onResume}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-4 bg-[#00ff9c] hover:bg-[#00e68a] text-black font-bold rounded-xl transition text-lg"
            >
              ▶ Resume
            </motion.button>
          )}
          <motion.button
            onClick={onEnd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-4 bg-linear-to-r from-[#FE9A00] to-[#FFA500] hover:shadow-xl text-black font-bold rounded-xl transition text-lg"
          >
            ✓ End Workout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Session Complete Screen - Professional Report Card
const SessionCompleteScreen = ({ stats, timer, navigate }) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getGrade = (percentage) => {
    if (percentage >= 95) return { grade: 'A+', color: '#00ff9c', label: 'Outstanding' };
    if (percentage >= 85) return { grade: 'A', color: '#00ff9c', label: 'Excellent' };
    if (percentage >= 75) return { grade: 'B+', color: '#FE9A00', label: 'Great' };
    if (percentage >= 65) return { grade: 'B', color: '#FE9A00', label: 'Good' };
    if (percentage >= 50) return { grade: 'C', color: '#fbbf24', label: 'Fair' };
    return { grade: 'D', color: '#ff6b6b', label: 'Needs Work' };
  };

  const gradeInfo = getGrade(stats.percentage);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FE9A00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ff9c]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl w-full"
      >
        {/* Report Card Container */}
        <div className="bg-gradient-to-br from-[#1a1d23] to-[#0f1115] border-2 border-[#FE9A00]/30 rounded-3xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#FE9A00] to-[#FFA500] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-black/60 uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Workout Report
                </h2>
                <h1 className="text-3xl md:text-4xl font-black text-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  SESSION COMPLETE
                </h1>
              </div>
              <div className="text-right">
                <div className="text-xs text-black/60 uppercase tracking-wider mb-1">Date</div>
                <div className="text-lg font-bold text-black">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Grade Section */}
          <div className="px-8 py-10 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-[#a8adb3] uppercase tracking-wider mb-2">Overall Performance</div>
                <div className="text-2xl font-bold text-white mb-1">{gradeInfo.label}</div>
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 bg-black/40 rounded-full overflow-hidden max-w-md">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.percentage}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}dd)` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-[#a8adb3]">{stats.percentage}%</span>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                className="ml-8"
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 relative"
                  style={{
                    borderColor: gradeInfo.color,
                    background: `radial-gradient(circle, ${gradeInfo.color}20, transparent)`
                  }}
                >
                  <div className="text-center">
                    <div className="text-5xl font-black" style={{ color: gradeInfo.color, fontFamily: "'Outfit', sans-serif" }}>
                      {gradeInfo.grade}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ReportStatItem
                label="Sets Completed"
                value={stats.completed}
                total={stats.totalSets}
                icon={<Icon name="checkCircle" className="w-6 h-6" />}
                color="#00ff9c"
                delay={0.5}
              />
              <ReportStatItem
                label="Duration"
                value={formatTime(timer)}
                icon={<Icon name="clock" className="w-6 h-6" />}
                color="#fbbf24"
                delay={0.6}
              />
              <ReportStatItem
                label="Total Volume"
                value={`${stats.volume.toLocaleString()} kg`}
                icon={<Icon name="dumbbell" className="w-6 h-6" />}
                color="#FE9A00"
                delay={0.7}
              />
              <ReportStatItem
                label="Calories"
                value={stats.calories || 0}
                icon={<Icon name="fire" className="w-6 h-6" />}
                color="#ff6b6b"
                delay={0.8}
              />
            </div>
          </div>

          {/* Achievement Banner */}
          {stats.percentage === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mx-8 mb-8 px-6 py-4 bg-gradient-to-r from-[#00ff9c]/20 to-[#00ff9c]/10 border border-[#00ff9c]/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Icon name="trophy" className="w-6 h-6 text-[#00ff9c]" />
                <div>
                  <div className="font-bold text-[#00ff9c]">Perfect Completion!</div>
                  <div className="text-sm text-[#a8adb3]">You completed every single set. Outstanding work!</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                View Dashboard
              </motion.button>
              <motion.button
                onClick={() => navigate("/workout-plans")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border-2 border-white/20 transition-all"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Next Workout
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-sm text-[#a8adb3]"
        >
          Great job! Your progress has been saved.
        </motion.div>
      </motion.div>
    </div>
  );
};

// Report Stat Item Component
const ReportStatItem = ({ label, value, total, icon, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[#a8adb3]">
          {icon}
        </div>
        {total && (
          <div className="text-xs font-mono text-[#a8adb3]">
            {value}/{total}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div
          className="text-2xl font-black font-mono"
          style={{ color }}
        >
          {total ? value : value}
        </div>
        <div className="text-xs text-[#a8adb3] uppercase tracking-wider font-semibold">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutSessionNew;
