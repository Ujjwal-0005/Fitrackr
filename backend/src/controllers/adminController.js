import { User } from "../models/User.js";
import { Exercise } from "../models/Exercise.js";
import { Session } from "../models/Session.js";
import WorkoutSession from "../models/WorkoutSession.js";
import { CustomWorkoutSession } from "../models/CustomWorkoutSession.js";
import { SmartGoal } from "../models/SmartGoal.js";
import { Goal } from "../models/Goal.js";
import { Meal } from "../models/Meal.js";
import { Achievement } from "../models/Achievement.js";
import { PersonalRecord } from "../models/PersonalRecord.js";
import { WorkoutPlan } from "../models/WorkoutPlan.js";
import { WorkoutTemplate } from "../models/WorkoutTemplate.js";
import { WeighIn } from "../models/WeighIn.js";

/**
 * 🧍 Get all registered users (admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "name email role createdAt").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("❌ getAllUsers failed:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

/**
 * 💪 Get all exercises
 */
export const getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({ createdAt: -1 });
        res.json(exercises);
    } catch (err) {
        console.error("❌ getAllExercises failed:", err);
        res.status(500).json({ message: "Failed to fetch exercises" });
    }
};

/**
 * 🔥 Get all active workout sessions
 */
export const getActiveSessions = async (req, res) => {
    try {
        const activeSessions = await Session.countDocuments({ status: "in_progress" });
        res.json({ activeSessions });
    } catch (err) {
        console.error("❌ getActiveSessions failed:", err);
        res.status(500).json({ message: "Failed to fetch active sessions" });
    }
};

/**
 * 👤 Create a new user (admin only)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Prevent creating admin users
        if (role === "admin") {
            return res.status(403).json({ message: "Cannot create admin users. Only regular users allowed." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Create user (force role to 'user')
        const user = await User.create({
            name,
            email,
            password, // Will be hashed by User model pre-save hook
            role: "user" // Always create as regular user
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("❌ createUser failed:", err);
        res.status(500).json({ message: "Failed to create user", error: err.message });
    }
};

/**
 * 🗑️ Delete a user (admin only)
 * Cascading delete: removes all user data from all collections
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        // Find user first to check role
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent deleting admin users
        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot delete admin users. Only regular users can be deleted." });
        }

        // 🔥 Cascading delete: Remove all user data from all collections
        const deletionResults = {};

        // Delete workout sessions
        const sessionsDeleted = await Session.deleteMany({ userId: id });
        deletionResults.sessions = sessionsDeleted.deletedCount;

        const workoutSessionsDeleted = await WorkoutSession.deleteMany({ userId: id });
        deletionResults.workoutSessions = workoutSessionsDeleted.deletedCount;

        const customSessionsDeleted = await CustomWorkoutSession.deleteMany({ userId: id });
        deletionResults.customSessions = customSessionsDeleted.deletedCount;

        // Delete goals
        const smartGoalsDeleted = await SmartGoal.deleteMany({ userId: id });
        deletionResults.smartGoals = smartGoalsDeleted.deletedCount;

        const goalsDeleted = await Goal.deleteMany({ userId: id });
        deletionResults.goals = goalsDeleted.deletedCount;

        // Delete nutrition data
        const mealsDeleted = await Meal.deleteMany({ userId: id });
        deletionResults.meals = mealsDeleted.deletedCount;

        // Delete achievements and records
        const achievementsDeleted = await Achievement.deleteMany({ userId: id });
        deletionResults.achievements = achievementsDeleted.deletedCount;

        const prsDeleted = await PersonalRecord.deleteMany({ userId: id });
        deletionResults.personalRecords = prsDeleted.deletedCount;

        // Delete workout plans and templates
        const plansDeleted = await WorkoutPlan.deleteMany({ userId: id });
        deletionResults.workoutPlans = plansDeleted.deletedCount;

        const templatesDeleted = await WorkoutTemplate.deleteMany({ userId: id });
        deletionResults.workoutTemplates = templatesDeleted.deletedCount;

        // Delete weigh-ins
        const weighInsDeleted = await WeighIn.deleteMany({ userId: id });
        deletionResults.weighIns = weighInsDeleted.deletedCount;

        // Finally, delete the user
        await User.findByIdAndDelete(id);

        // Calculate total records deleted
        const totalDeleted = Object.values(deletionResults).reduce((sum, count) => sum + count, 0);

        res.json({
            message: "User and all associated data deleted successfully",
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            deletionSummary: {
                ...deletionResults,
                totalRecordsDeleted: totalDeleted
            }
        });
    } catch (err) {
        console.error("❌ deleteUser failed:", err);
        res.status(500).json({ message: "Failed to delete user", error: err.message });
    }
};

/**
 * 📊 Get user progress details (admin only)
 */
export const getUserProgress = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id, "name email createdAt");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get user's sessions
        const sessions = await Session.find({ userId: id })
            .sort({ date: -1 })
            .limit(10);

        // Get total stats
        const totalSessions = await Session.countDocuments({ userId: id, status: "completed" });
        const totalCalories = await Session.aggregate([
            { $match: { userId: user._id, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$calories" } } }
        ]);

        res.json({
            user,
            sessions,
            stats: {
                totalSessions,
                totalCalories: totalCalories[0]?.total || 0
            }
        });
    } catch (err) {
        console.error("❌ getUserProgress failed:", err);
        res.status(500).json({ message: "Failed to fetch user progress" });
    }
};
