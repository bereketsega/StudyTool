import { Router } from "express";
import { GeminiController } from "../controllers/gemini.controller.js";

const GeminiRoute = Router();

/**
 * @route POST /api/gemini/generate-multiple-choice
 * @description Generate multiple choice questions
 */
GeminiRoute.post(
  "/generate-multiple-choice",
  GeminiController.generateMultipleChoiceQuestions,
);

export default GeminiRoute;
