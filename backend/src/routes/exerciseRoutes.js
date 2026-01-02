import express from "express";
import {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
} from "../controllers/exerciseController.js";
import { cookieAuth, adminOnly } from "../middleware/authmiddleware.js";

const router = express.Router();

// Public
router.get("/", getExercises);
router.get("/:id", getExerciseById);

// Admin-only CRUD
router.post("/", cookieAuth, adminOnly, createExercise);
router.put("/:id", cookieAuth, adminOnly, updateExercise);
router.delete("/:id", cookieAuth, adminOnly, deleteExercise);

export default router;
