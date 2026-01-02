import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
    createCustomSession,
    getCustomSessions,
    getCustomSession,
    updateCustomSession,
    deleteCustomSession,
    startCustomSession,
    getGoalDefaults,
} from "../controllers/customSessionController.js";

const router = express.Router();

router.get("/defaults", cookieAuth, getGoalDefaults);
router.post("/", cookieAuth, createCustomSession);
router.get("/", cookieAuth, getCustomSessions);
router.get("/:id", cookieAuth, getCustomSession);
router.put("/:id", cookieAuth, updateCustomSession);
router.delete("/:id", cookieAuth, deleteCustomSession);
router.post("/:id/start", cookieAuth, startCustomSession);

export default router;
