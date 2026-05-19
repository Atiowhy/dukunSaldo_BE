// src/services/predictionService.js
import prisma from "../config/prisma.js";

// Fungsi bantuan untuk format 'YYYY-MM'
const getMonthYear = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month < 10) month = `0${month}`;
  return `${year}-${month}`;
};

export const getPreparedMonthlyData = async (firebaseUid) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) throw new Error("User tidak ditemukan");

  // 1. Ambil data pengeluaran, urut dari yang paling lama
  const expenses = await prisma.transaction.findMany({
    where: { userId: user.id, category: { type: "EXPENSE" } },
    orderBy: { date: "asc" },
  });

  if (expenses.length === 0) return [];

  // 2. Kelompokkan total per bulan
  const groupedData = {};
  expenses.forEach((trx) => {
    const monthYear = getMonthYear(trx.date);
    if (!groupedData[monthYear]) groupedData[monthYear] = 0;
    groupedData[monthYear] += trx.amount;
  });

  // 3. Zero-Filling (Tambal bulan yang tidak ada transaksinya dengan angka 0)
  const sortedMonths = Object.keys(groupedData).sort();
  const startMonth = sortedMonths[0];
  const endMonth = sortedMonths[sortedMonths.length - 1];

  const finalTimeSeriesData = [];
  let currentDate = new Date(`${startMonth}-01`);
  const endDate = new Date(`${endMonth}-01`);

  while (currentDate <= endDate) {
    const currentMonthYear = getMonthYear(currentDate);
    finalTimeSeriesData.push({
      period: currentMonthYear,
      actualExpense: groupedData[currentMonthYear] || 0,
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return finalTimeSeriesData;
};

// Algoritma Double Exponential Smoothing (DES)
export const calculateDESPrediction = (
  timeSeriesData,
  alpha = 0.5,
  beta = 0.3,
) => {
  if (timeSeriesData.length === 0) return null;

  if (timeSeriesData.length === 1) {
    return {
      predictedExpense: timeSeriesData[0].actualExpense,
      alphaUsed: alpha,
      betaUsed: beta,
    };
  }

  // Inisialisasi Level (S) dan Trend (b)
  let previousLevel = timeSeriesData[0].actualExpense;
  let previousTrend =
    timeSeriesData[1].actualExpense - timeSeriesData[0].actualExpense;

  for (let i = 1; i < timeSeriesData.length; i++) {
    const currentActual = timeSeriesData[i].actualExpense;

    // Hitung Level dan Trend periode ini
    const currentLevel =
      alpha * currentActual + (1 - alpha) * (previousLevel + previousTrend);
    const currentTrend =
      beta * (currentLevel - previousLevel) + (1 - beta) * previousTrend;

    previousLevel = currentLevel;
    previousTrend = currentTrend;
  }

  // Prediksi masa depan = Level + Trend
  const nextPrediction = previousLevel + previousTrend;

  return {
    predictedExpense: Math.max(0, Math.round(nextPrediction)), // Cegah hasil prediksi minus
    alphaUsed: alpha,
    betaUsed: beta,
    currentLevel: Math.round(previousLevel),
    currentTrend: Math.round(previousTrend),
  };
};

// Tambahkan di bagian bawah file predictionService.js

export const getEWSAndRecommendation = async (
  firebaseUid,
  predictedExpense,
  lastDataPeriod,
) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });

  // 1. HITUNG RATA-RATA PEMASUKAN (INCOME)
  const incomes = await prisma.transaction.findMany({
    where: { userId: user.id, category: { type: "INCOME" } },
  });

  let averageIncome = 0;
  if (incomes.length > 0) {
    const groupedIncome = {};
    incomes.forEach((trx) => {
      // Ambil format YYYY-MM dari tanggal transaksi
      const monthYear = new Date(trx.date).toISOString().slice(0, 7);
      if (!groupedIncome[monthYear]) groupedIncome[monthYear] = 0;
      groupedIncome[monthYear] += trx.amount;
    });
    const totalMonths = Object.keys(groupedIncome).length;
    const totalIncome = Object.values(groupedIncome).reduce(
      (sum, val) => sum + val,
      0,
    );
    averageIncome = totalIncome / totalMonths;
  }

  // 2. CARI KATEGORI PENGELUARAN TERBESAR DI BULAN TERAKHIR
  // lastDataPeriod formatnya 'YYYY-MM' (contoh: '2026-05')
  const startOfMonth = new Date(`${lastDataPeriod}-01T00:00:00.000Z`);
  const endOfMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const lastMonthExpenses = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
      category: { type: "EXPENSE" },
    },
    include: { category: true }, // Bawa nama kategorinya
  });

  let topCategoryName = null;
  let topCategoryAmount = 0;

  if (lastMonthExpenses.length > 0) {
    const categorySums = {};
    lastMonthExpenses.forEach((t) => {
      if (!categorySums[t.category.name]) categorySums[t.category.name] = 0;
      categorySums[t.category.name] += t.amount;
    });

    // Cari nilai tertinggi
    for (const [cat, val] of Object.entries(categorySums)) {
      if (val > topCategoryAmount) {
        topCategoryAmount = val;
        topCategoryName = cat;
      }
    }
  }

  // 3. LOGIKA EARLY WARNING SYSTEM (EWS) & REKOMENDASI DOKTER KEUANGAN
  let ewsStatus = "SAFE";
  let ewsMessage = "Keuanganmu dalam kondisi aman dan terkendali.";
  let recommendation =
    "Keuanganmu sangat sehat! Pertahankan kebiasaan ini dan jangan lupa alokasikan sisa uang bulan ini untuk ditabung atau diinvestasikan.";

  if (averageIncome === 0) {
    ewsStatus = "WARNING";
    ewsMessage = "Belum ada data pemasukan untuk dianalisis.";
    recommendation =
      "Catat pemasukanmu (seperti gaji/uang saku) agar sistem bisa menganalisis kesehatan keuanganmu secara akurat.";
  } else if (predictedExpense > averageIncome) {
    ewsStatus = "DANGER";
    ewsMessage =
      "BAHAYA! Prediksi pengeluaran bulan depan melebihi rata-rata pemasukanmu.";
    if (topCategoryName) {
      recommendation = `Awas potensi defisit/ngutang! Coba kurangi pengeluaran di kategori [${topCategoryName}] yang memakan biaya Rp ${topCategoryAmount.toLocaleString("id-ID")} bulan lalu.`;
    } else {
      recommendation = `Awas potensi defisit! Rem pengeluaran yang tidak penting agar kamu tidak berhutang bulan depan.`;
    }
  } else if (predictedExpense >= 0.8 * averageIncome) {
    // Batas warning 80% dari gaji
    ewsStatus = "WARNING";
    ewsMessage =
      "WASPADA! Prediksi pengeluaranmu mendekati batas pemasukan (sudah > 80%).";
    if (topCategoryName) {
      recommendation = `Kamu mulai boros. Perhatikan pengeluaran di kategori [${topCategoryName}] yang mencapai Rp ${topCategoryAmount.toLocaleString("id-ID")} bulan lalu.`;
    } else {
      recommendation = `Kamu mulai boros. Mulai evaluasi pengeluaran harianmu dari sekarang.`;
    }
  }

  return {
    status: ewsStatus,
    averageIncome: Math.round(averageIncome),
    message: ewsMessage,
    recommendationText: recommendation,
  };
};
