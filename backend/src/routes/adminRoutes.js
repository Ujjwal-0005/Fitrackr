// backend/src/routes/adminRoutes.js
import express from "express";
import { cookieAuth, adminOnly } from "../middleware/authmiddleware.js";
import {
    getAllUsers,
    getAllExercises,
    getActiveSessions,
    createUser,
    deleteUser,
    getUserProgress
} from "../controllers/adminController.js";
import {
    createExercise,
    getExerciseById,
    updateExercise,
    deleteExercise,
    getExercises,
} from "../controllers/exerciseController.js";
import { getUsersProgress } from "../controllers/userProgressController.js";

const router = express.Router();

/* ---------------- USERS ---------------- */
router.get("/users", cookieAuth, adminOnly, getAllUsers);
router.post("/users", cookieAuth, adminOnly, createUser);
router.delete("/users/:id", cookieAuth, adminOnly, deleteUser);
router.get("/users/:id/progress", cookieAuth, adminOnly, getUserProgress);
router.get("/users-progress", cookieAuth, adminOnly, getUsersProgress);

/* ---------------- EXERCISES ---------------- */
router.get("/exercises", cookieAuth, adminOnly, getExercises);
router.get("/exercises/:id", cookieAuth, adminOnly, getExerciseById);
router.post("/exercises", cookieAuth, adminOnly, createExercise);
router.put("/exercises/:id", cookieAuth, adminOnly, updateExercise);
router.delete("/exercises/:id", cookieAuth, adminOnly, deleteExercise);

/* ---------------- ACTIVE SESSIONS ---------------- */
router.get("/sessions/active", cookieAuth, adminOnly, getActiveSessions);

export default router;
