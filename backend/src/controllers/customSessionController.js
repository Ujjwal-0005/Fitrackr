import { CustomWorkoutSession } from "../models/CustomWorkoutSession.js";
import { SmartGoal } from "../models/SmartGoal.js";
import { getGoalBasedDefaults, getSuggestedExercises } from "../utils/goalAwareDefaults.js";
import { Session } from "../models/Session.js";
// @desc  Create a new custom workout session
// @route POST /api/v1/custom-sessions
// @access Private
export const createCustomSession = async (req, res) => {
    try {
        const { sessionName, focus, exercises, goalId, estimatedDuration } = req.body;

        console.log('🔵 Creating custom session:', { sessionName, focus, userId: req.user._id });

        const session = await CustomWorkoutSession.create({
            userId: req.user._id,
            goalId,
            sessionName,
            focus,
            exercises,
            estimatedDuration: estimatedDuration || 45,
            isTemplate: true,
        });

        console.log('✅ Custom session created:', session._id);

        res.status(201).json({
            message: "Custom session created",
            session,
        });
    } catch (err) {
        console.error('❌ createCustomSession failed:', err);
        res.status(500).json({ message: "Failed to create session", error: err.message });
    }
};

// @desc  Get all custom sessions for current user
// @route GET /api/v1/custom-sessions
// @access Private
export const getCustomSessions = async (req, res) => {
    try {
        const { goalId } = req.query;

        const query = { userId: req.user._id };
        if (goalId) {
            query.goalId = goalId;
        }

        const sessions = await CustomWorkoutSession.find(query)
            .sort({ lastUsed: -1, createdAt: -1 })
            .lean();

        res.json({ sessions });
    } catch (err) {
        console.error('❌ getCustomSessions failed:', err);
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

// @desc  Get single custom session
// @route GET /api/v1/custom-sessions/:id
// @access Private
export const getCustomSession = async (req, res) => {
    try {
        const session = await CustomWorkoutSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.json({ session });
    } catch (err) {
        console.error('❌ getCustomSession failed:', err);
        res.status(500).json({ message: "Failed to fetch session" });
    }
};

// @desc  Update custom session
// @route PUT /api/v1/custom-sessions/:id
// @access Private
export const updateCustomSession = async (req, res) => {
    try {
        const { sessionName, focus, exercises, estimatedDuration } = req.body;

        const session = await CustomWorkoutSession.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            {
                sessionName,
                focus,
                exercises,
                estimatedDuration,
            },
            { new: true, runValidators: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        console.log('✅ Custom session updated:', session._id);

        res.json({ message: "Session updated", session });
    } catch (err) {
        console.error('❌ updateCustomSession failed:', err);
        res.status(500).json({ message: "Failed to update session", error: err.message });
    }
};

// @desc  Delete custom session
// @route DELETE /api/v1/custom-sessions/:id
// @access Private
export const deleteCustomSession = async (req, res) => {
    try {
        const session = await CustomWorkoutSession.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        console.log('✅ Custom session deleted:', session._id);

        res.json({ message: "Session deleted" });
    } catch (err) {
        console.error('❌ deleteCustomSession failed:', err);
        res.status(500).json({ message: "Failed to delete session" });
    }
};

// @desc  Start a custom session (create workout log)
// @route POST /api/v1/custom-sessions/:id/start
// @access Private
export const startCustomSession = async (req, res) => {
    try {
        const { forceStart } = req.body;

        console.log('🔵 Starting custom session:', {
            sessionId: req.params.id,
            userId: req.user._id,
            forceStart
        });

        const customSession = await CustomWorkoutSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!customSession) {
            console.error('❌ Custom session not found:', req.params.id);
            return res.status(404).json({ message: "Session not found" });
        }

        console.log('✅ Custom session found:', {
            name: customSession.sessionName,
            exerciseCount: customSession.exercises?.length || 0,
            exercises: customSession.exercises?.map(ex => ({ name: ex.name, sets: ex.sets, reps: ex.reps }))
        });

        // Validate custom session has exercises
        if (!customSession.exercises || customSession.exercises.length === 0) {
            console.error('❌ No exercises in custom session');
            return res.status(400).json({
                message: "Custom session has no exercises"
            });
        }

        // Validate all exercises have names
        const invalidExercises = customSession.exercises.filter(ex => !ex.name);
        if (invalidExercises.length > 0) {
            console.error('❌ Invalid exercises found:', invalidExercises);
            return res.status(400).json({
                message: "Some exercises are missing names",
                invalidCount: invalidExercises.length,
                invalidExercises: invalidExercises
            });
        }

        // Cleanup stale sessions (older than 24 hours)
        const cleanedCount = await Session.cleanupStaleSessions(req.user._id);
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} stale session(s)`);
        }

        // Check for active session
        const activeSession = await Session.findOne({
            userId: req.user._id,
            status: "in_progress",
        });

        console.log('🔍 Active session check:', {
            hasActiveSession: !!activeSession,
            activeSessionId: activeSession?._id,
            forceStart
        });

        if (activeSession) {
            if (!forceStart) {
                console.log('⚠️ Active session exists, returning error with force-start option');
                return res.status(400).json({
                    message: "You already have an active workout session",
                    activeSession: {
                        _id: activeSession._id,
                        startTime: activeSession.startTime,
                        sessionType: activeSession.sessionType,
                        exerciseCount: activeSession.exercises.length
                    },
                    canForceStart: true
                });
            } else {
                // Force start: abandon the current session
                console.log('⚠️ Force starting - abandoning active session:', activeSession._id);
                await activeSession.abandonSession();
            }
        }

        console.log('🔍 Creating session from custom template:', {
            customSessionId: customSession._id,
            sessionName: customSession.sessionName,
            exerciseCount: customSession.exercises.length,
            exercises: customSession.exercises.map(ex => ({
                id: ex.exerciseId,
                name: ex.name
            }))
        });

        // Create new workout session from custom template
        const workoutSession = await Session.create({
            userId: req.user._id,
            date: new Date(),
            startTime: new Date(),
            status: "in_progress",
            sessionType: "custom",
            exercises: customSession.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                nameSnapshot: ex.name,
                sets: [],
                completed: false,
            })),
            customSessionId: customSession._id,
            customSessionTemplateId: customSession._id,
        });

        // Update lastUsed timestamp
        await customSession.markAsUsed();

        console.log('✅ Custom session started:', workoutSession._id);

        res.status(201).json({
            message: "Workout session started",
            session: workoutSession,
            customSession,
        });
    } catch (err) {
        console.error('❌ startCustomSession failed:', err);
        res.status(500).json({ message: "Failed to start session", error: err.message });
    }
};

// @desc  Get goal-aware defaults
// @route GET /api/v1/custom-sessions/defaults
// @access Private
export const getGoalDefaults = async (req, res) => {
    try {
        const { goalId } = req.query;

        let defaults = getGoalBasedDefaults("general_fitness");

        if (goalId) {
            const goal = await SmartGoal.findOne({
                _id: goalId,
                userId: req.user._id,
            });

            if (goal) {
                defaults = getGoalBasedDefaults(goal.type);
                defaults.goalStatement = goal.statement;
            }
        }

        res.json({ defaults });
    } catch (err) {
        console.error('❌ getGoalDefaults failed:', err);
        res.status(500).json({ message: "Failed to fetch defaults" });
    }
};
