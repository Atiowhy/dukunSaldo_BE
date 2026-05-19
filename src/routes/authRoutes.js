// src/routes/authRoutes.js
import express from "express";
import { mockLogin } from "../controllers/authControler.js";

const router = express.Router();

// Route POST: http://localhost:3000/api/auth/mock-login
router.post("/mock-login", mockLogin);

export default router;
