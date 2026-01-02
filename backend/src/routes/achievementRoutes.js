import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import { getMyAchievements, checkAchievements } from "../controllers/achievementController.js";

const router = express.Router();

router.get("/", cookieAuth, getMyAchievements);
router.post("/check", cookieAuth, checkAchievements);

export default router;
