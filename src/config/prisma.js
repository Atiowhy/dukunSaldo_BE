// src/config/prisma.js
import { PrismaClient } from "@prisma/client";

// Menginisialisasi Prisma Client
const prisma = new PrismaClient({
  // Log query ini opsional, tapi sangat membantu saat debugging
  // agar kamu bisa melihat aktivitas SQL-nya di terminal
  log: ["query", "info", "warn", "error"],
});

export default prisma;
