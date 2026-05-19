// src/services/subscriptionService.js
import prisma from "../config/prisma.js";

// Fungsi untuk Membuat Langganan Baru
export const createSubscriptionService = async (firebaseUid, data) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) throw new Error("User tidak ditemukan");

  const { name, amount, dueDate, isActive } = data;

  return await prisma.subscription.create({
    data: {
      userId: user.id,
      name,
      amount,
      dueDate: parseInt(dueDate), // Format wajib ISO, misal: "2026-05-16T00:00:00Z"
      isActive: isActive !== undefined ? isActive : true,
    },
  });
};

// Fungsi untuk Mengambil Semua Data Langganan Milik User
export const getUserSubscriptionsService = async (firebaseUid) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) throw new Error("User tidak ditemukan");

  return await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" }, // Diurutkan dari tagihan yang paling dekat waktunya
  });
};
