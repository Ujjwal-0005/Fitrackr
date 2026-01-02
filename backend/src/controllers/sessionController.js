import mongoose from "mongoose";
import { Session } from "../models/Session.js";
import { calculateCalories } from "../utils/calorieCalculator.js";
import { triggerGoalRecalculation } from "../utils/goalRecalculation.js";
/**
 * Create a new workout session for a user
 */
export const createSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    // check for active session
    const active = await Session.findOne({ userId, status: "in_progress" });
    if (active) {
      return res.status(400).json({
        message: "You already have an active workout session.",
        session: active,
      });
    }

    const session = await Session.create({
      userId,
      date: new Date(),
      startTime: new Date(),
      status: "in_progress",
      exercises: [],
    });

    res.status(201).json({
      message: "Session started successfully",
      session,
    });
  } catch (err) {
    console.error("❌ createSession failed:", err);
    res.status(500).json({ message: "Server error while starting session" });
  }
};

/**
 * Add a new exercise to a workout session
 /**
 * Add a new exercise to a workout session
 * Body: { sessionId, exerciseId, nameSnapshot, muscleSnapshot }
 */
export const addExercise = async (req, res) => {
  try {
    const { sessionId, exerciseId, nameSnapshot, muscleSnapshot } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // ✅ Removed duplicate prevention — allow same exercise multiple times
    // Just push a new subdocument each time
    const newExercise = {
      exerciseId,
      nameSnapshot,
      muscleSnapshot,
      sets: [],
      completed: false,
    };

    session.exercises.push(newExercise);
    await session.save();

    return res.status(200).json({
      message: "Exercise added successfully",
      exercise: session.exercises[session.exercises.length - 1],
    });
  } catch (err) {
    console.error("Add exercise failed:", err);
    res.status(500).json({ message: "Server error while adding exercise" });
  }
};

/**
 * Add a set to an exercise
 */
/**
 * Add a set to an exercise
 */
export const addSet = async (req, res) => {
  try {
    const { sessionId, exerciseId, reps, weightKg, duration, speed } = req.body;

    console.log('🔵 addSet called:', { sessionId, exerciseId, reps, weightKg });

    if (!sessionId || !exerciseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return res.status(404).json({ message: "Session not found" });
    }

    console.log('🔍 Session exercises:', session.exercises.map(e => ({
      nameSnapshot: e.nameSnapshot,
      exerciseId: e.exerciseId
    })));

    // Match by nameSnapshot (case-insensitive) since exerciseId is optional
    const exercise = session.exercises.find(
      (e) => {
        const nameMatch = e.nameSnapshot?.toLowerCase() === exerciseId.toLowerCase();
        const idMatch = e.exerciseId?.toString() === exerciseId.toString();
        return nameMatch || idMatch;
      }
    );

    if (!exercise) {
      console.error('❌ Exercise not found. Looking for:', exerciseId);
      console.error('Available exercises:', session.exercises.map(e => e.nameSnapshot));
      return res.status(404).json({ message: "Exercise not found in session" });
    }

    console.log('✅ Found exercise:', exercise.nameSnapshot);

    // ✅ Create set object - support both time-based and weight-based
    let newSet = { completed: false };

    // Check if this is a time-based set (has duration but no weight)
    const isTimeBased = duration && duration > 0 && (!weightKg || weightKg === 0);

    if (isTimeBased) {
      // Time-based set: duration + reps (for fat loss/cardio workouts)
      newSet.duration = duration; // Duration in seconds from frontend
      newSet.reps = reps || 0;
      console.log('🔵 Creating time-based set:', { duration, reps });
    } else if (exercise.exerciseType === 'cardio' && speed) {
      // Traditional cardio set: duration + speed
      if (!duration || !speed) {
        return res.status(400).json({ message: "Duration and speed required for cardio exercises" });
      }

      const distance = (speed * duration) / 60; // km
      const caloriesBurned = Math.round((duration / 60) * 8 * 75); // Simple formula: hours × MET × weight

      newSet = {
        duration,
        speed,
        distance,
        caloriesBurned,
        completed: false
      };
      console.log('🔵 Creating cardio set:', { duration, speed, distance });
    } else {
      // Weight-based set: reps + weight
      if (!reps || reps === 0) {
        return res.status(400).json({ message: "Reps required for strength exercises" });
      }
      newSet.reps = reps;
      newSet.weightKg = weightKg || 0;
      console.log('🔵 Creating weight-based set:', { reps, weightKg });
    }

    exercise.sets.push(newSet);

    // ✅ Save only once
    await session.save();

    console.log('✅ Set added successfully to', exercise.nameSnapshot);

    // ✅ Return the updated exercise, not full session
    return res.status(200).json({
      message: "Set added successfully",
      set: exercise.sets[exercise.sets.length - 1],
      exercise: {
        ...exercise.toObject(),
        sets: exercise.sets,
      },
    });
  } catch (err) {
    console.error("❌ addSet failed:", err);
    res.status(500).json({ message: "Server error while adding set" });
  }
};
/**
 * Mark set as completed
 */
export const markSetCompleted = async (req, res) => {
  try {
    const { sessionId, exerciseId, setId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const ex = session.exercises.find(
      (e) => e.exerciseId.toString() === exerciseId.toString()
    );
    if (!ex)
      return res.status(404).json({ message: "Exercise not found in session" });

    const set = ex.sets.id(setId);
    if (!set) return res.status(404).json({ message: "Set not found" });

    set.completed = true;
    await session.save();
    res.json({ message: "Set marked as completed" });
  } catch (err) {
    console.error("❌ markSetCompleted failed:", err);
    res.status(500).json({ message: "Server error while marking set completed" });
  }
};

/**
 * Remove a specific set
 */
export const removeSet = async (req, res) => {
  try {
    const { sessionId, exerciseId, setId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const ex = session.exercises.find(
      (e) => e.exerciseId.toString() === exerciseId.toString()
    );
    if (!ex)
      return res.status(404).json({ message: "Exercise not found in session" });

    const set = ex.sets.id(setId);
    if (!set) return res.status(404).json({ message: "Set not found" });

    set.deleteOne();
    await session.save();
    res.json({ message: "Set removed" });
  } catch (err) {
    console.error("❌ removeSet failed:", err);
    res.status(500).json({ message: "Server error while removing set" });
  }
};

/**
 * Remove an exercise from session
 */
export const removeExercise = async (req, res) => {
  try {
    const { sessionId, exerciseId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const before = session.exercises.length;
    session.exercises = session.exercises.filter(
      (e) => e.exerciseId.toString() !== exerciseId.toString()
    );

    if (session.exercises.length === before)
      return res.status(404).json({ message: "Exercise not found in session" });

    await session.save();
    res.json({ message: "Exercise removed" });
  } catch (err) {
    console.error("❌ removeExercise failed:", err);
    res.status(500).json({ message: "Server error while removing exercise" });
  }
};

/**
 * Conclude session (calculate calories, duration)
 */

// ✅ Conclude a session
export const concludeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { calories, durationMin, status, planGoal, planLevel, dayNumber } = req.body;

    console.log('🔵 concludeSession (regular) called:', {
      sessionId: id,
      calories,
      durationMin,
      status,
      planGoal,
      planLevel,
      dayNumber,
      userId: req.user._id
    });

    const session = await Session.findById(id);
    if (!session) {
      console.error('❌ Session not found:', id);
      return res.status(404).json({ message: "Session not found" });
    }

    console.log('🟡 Found session, updating:', {
      currentStatus: session.status,
      newStatus: status || "completed",
      exercisesCount: session.exercises?.length || 0
    });

    session.status = status || "completed";
    session.calories = calories || session.calories;
    session.durationMin = durationMin || session.durationMin;
    session.endedAt = new Date();

    // Store plan tracking information
    if (planGoal) session.planGoal = planGoal;
    if (planLevel) session.planLevel = planLevel;
    if (dayNumber) session.dayNumber = dayNumber;

    await session.save();

    console.log('✅ Session saved successfully (regular):', {
      id: session._id,
      status: session.status,
      calories: session.calories,
      duration: session.durationMin
    });

    // Auto-unlock achievements
    try {
      const { checkAchievements } = await import('./achievementController.js');
      await checkAchievements(req, { json: () => { } }); // Silent check
      console.log('✅ Achievements checked automatically');
    } catch (achErr) {
      console.error('⚠️ Achievement check failed (non-critical):', achErr.message);
    }

    // Trigger goal recalculation (async, don't wait)
    triggerGoalRecalculation(req.user._id).catch(err => {
      console.error('Goal recalculation failed (non-blocking):', err.message);
    });

    res.json({ message: "Workout session completed ✅", session });
  } catch (err) {
    console.error("❌ concludeSession failed:", err);
    res.status(500).json({ message: "Failed to conclude session", error: err.message });
  }
};

/**
 * Get all sessions of current user
 */
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(sessions);
  } catch (err) {
    console.error("❌ getMySessions failed:", err);
    res.status(500).json({ message: "Failed to load sessions" });
  }
};

/**
 * Get completed days for a specific workout plan
 */
export const getCompletedDays = async (req, res) => {
  try {
    const { planGoal, planLevel } = req.query;
    const userId = req.user._id;

    console.log('🔵 getCompletedDays called:', { userId, planGoal, planLevel });

    if (!planGoal || !planLevel) {
      return res.status(400).json({ message: "planGoal and planLevel are required" });
    }

    const completedSessions = await Session.find({
      userId,
      planGoal,
      planLevel,
      status: 'completed',
      dayNumber: { $exists: true, $ne: null }
    }).select('dayNumber date');

    console.log('🟢 Found completed sessions:', completedSessions.length);

    // Extract unique day numbers
    const completedDays = [...new Set(completedSessions.map(s => s.dayNumber))];

    console.log('✅ Completed days:', completedDays);

    res.json({ completedDays });
  } catch (err) {
    console.error("❌ getCompletedDays failed:", err);
    res.status(500).json({ message: "Failed to fetch completed days" });
  }
};

/**
 * Get single session by id
 */
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    console.error("❌ getSessionById failed:", err);
    res.status(500).json({ message: "Failed to fetch session" });
  }
};
