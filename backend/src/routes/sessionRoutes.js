import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  createSession,
  addExercise,
  addSet,
  markSetCompleted,
  removeSet,
  removeExercise,
  concludeSession,
  getMySessions,
  getCompletedDays,
  getSessionById,
} from "../controllers/sessionController.js";

const router = express.Router();

// 🔹 Important: keep /my-sessions and /completed-days ABOVE /:id
router.get("/my-sessions", cookieAuth, getMySessions);
router.get("/completed-days", cookieAuth, getCompletedDays);
router.get("/:id", cookieAuth, getSessionById);

router.post("/", cookieAuth, createSession);
router.post("/add-exercise", cookieAuth, addExercise);
router.post("/add-set", cookieAuth, addSet);
router.post("/mark-complete", cookieAuth, markSetCompleted);
router.delete("/remove-set", cookieAuth, removeSet);
router.delete("/remove-exercise", cookieAuth, removeExercise);
router.put("/:id/conclude", cookieAuth, concludeSession);

export default router;
