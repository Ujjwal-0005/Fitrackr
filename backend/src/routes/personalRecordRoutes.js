import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  getMyPRs,
  upsertPR,
  deletePR,
  autoDetectPRs,
} from "../controllers/personalRecordController.js";

const router = express.Router();

router.get("/", cookieAuth, getMyPRs);
router.post("/", cookieAuth, upsertPR);
router.post("/auto-detect", cookieAuth, autoDetectPRs);
router.delete("/:id", cookieAuth, deletePR);

export default router;
