import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  getMyTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/", cookieAuth, getMyTemplates);
router.get("/:id", cookieAuth, getTemplateById);
router.post("/", cookieAuth, createTemplate);
router.put("/:id", cookieAuth, updateTemplate);
router.delete("/:id", cookieAuth, deleteTemplate);
router.post("/:id/use", cookieAuth, useTemplate);

export default router;
