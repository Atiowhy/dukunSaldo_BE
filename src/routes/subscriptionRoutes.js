// src/routes/subscriptionRoutes.js
import express from "express";
import {
  createSubscription,
  getSubscriptions,
} from "../controllers/subscriptionController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua jalur ini wajib pakai Bearer Token
router.post("/", verifyToken, createSubscription);
router.get("/", verifyToken, getSubscriptions);

export default router;
