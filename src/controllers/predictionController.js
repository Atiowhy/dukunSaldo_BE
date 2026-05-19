// src/controllers/predictionController.js
import {
  getPreparedMonthlyData,
  calculateDESPrediction,
  getEWSAndRecommendation,
} from "../services/predictionService.js";

export const getExpensePrediction = async (req, res) => {
  try {
    const { firebaseUid } = req.user;

    const alphaValue = req.query.alpha ? parseFloat(req.query.alpha) : 0.5;
    const betaValue = req.query.beta ? parseFloat(req.query.beta) : 0.3;

    // 1. Siapkan data historis
    const monthlyData = await getPreparedMonthlyData(firebaseUid);

    if (monthlyData.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Data kurang. Metode DES butuh minimal 2 bulan transaksi pengeluaran.",
      });
    }

    // 2. Eksekusi Rumus DES
    const predictionResult = calculateDESPrediction(
      monthlyData,
      alphaValue,
      betaValue,
    );
    const predictedExpense = predictionResult.predictedExpense;

    // 3. Tentukan periode (bulan dan tahun) hasil prediksi
    const lastDataPeriod = monthlyData[monthlyData.length - 1].period; // contoh: '2026-05'
    const lastDate = new Date(`${lastDataPeriod}-01`);
    lastDate.setMonth(lastDate.getMonth() + 1);

    const nextMonth = String(lastDate.getMonth() + 1).padStart(2, "0");
    const nextPeriod = `${lastDate.getFullYear()}-${nextMonth}`;

    // ====================================================================
    // 4. ANALISIS EARLY WARNING SYSTEM (EWS) & REKOMENDASI (FITUR BARU)
    // ====================================================================
    const ewsAnalysis = await getEWSAndRecommendation(
      firebaseUid,
      predictedExpense,
      lastDataPeriod,
    );

    // 5. Kirim Respons Super Lengkap
    res.status(200).json({
      success: true,
      message: "Analisis prediksi arus kas berhasil diselesaikan",
      data: {
        predictionTargetPeriod: nextPeriod,
        prediction: {
          predictedExpense: predictionResult.predictedExpense,
          level: predictionResult.currentLevel,
          trend: predictionResult.currentTrend,
        },
        ews: {
          status: ewsAnalysis.status, // SAFE | WARNING | DANGER
          averageIncome: ewsAnalysis.averageIncome,
          message: ewsAnalysis.message,
        },
        recommendation: ewsAnalysis.recommendationText,
        historicalData: monthlyData,
      },
    });
  } catch (error) {
    console.error("Error Get Prediction: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menghitung prediksi",
    });
  }
};
