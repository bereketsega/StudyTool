import { FileExtractor } from "../utils/file-extractor.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

export class GeminiController {
  static generateMultipleChoiceQuestions = async (req, res) => {
    const base64String = req.body.content;
    if (!base64String) {
      return res.status(400).json({ error: "Base64 string is required" });
    }
    // TODO
    const fileExtractor = new FileExtractor();
    const fileContnent = await fileExtractor.extractFromPptx(base64String);
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate as much multiple choice questions as you can with this information: ${fileContnent}. Return each questions with 4 options and 1 correct option in a json format.`,
    });
    const match = response.text.match(/```json([\s\S]*?)```/);
    if (!match) {
      res.status(500).json({ message: "JSON block not found" });
    } else {
      const jsonString = match[1].trim();
      try {
        res.status(200).json({ message: JSON.parse(jsonString) });
      } catch (err) {
        res.status(500).json({ message: "Invalid JSON" });
      }
    }
  };
}
