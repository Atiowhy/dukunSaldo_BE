// src/routes/categoryRoutes.js
import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";
// import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Terapkan verifyToken agar endpoint ini aman
router.get("/", getAllCategories);
// router.post("/", verifyToken, createCategory)

export default router;
