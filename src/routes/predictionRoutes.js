// src/routes/predictionRoutes.js
import express from "express";
import { getExpensePrediction } from "../controllers/predictionController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/expense", verifyToken, getExpensePrediction);

export default router;
