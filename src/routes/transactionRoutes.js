// src/routes/transactionRoutes.js
import express from "express";
import {
  createTransaction,
  getUserTransactions,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Terapkan verifyToken agar hanya user yang login yang bisa mengakses
router.post("/", verifyToken, createTransaction);
router.get("/", verifyToken, getUserTransactions);
router.put("/:id", verifyToken, updateTransaction);
router.delete("/:id", verifyToken, deleteTransaction);

export default router;
