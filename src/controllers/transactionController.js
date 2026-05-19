import {
  createTransactionService,
  getUserTransactionsServie,
  updateTransactionService,
  deleteTransactionService,
} from "../services/transactionsService.js";

export const createTransaction = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { categoryId, amount, date, description } = req.body;

    if (!categoryId || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Kategori, jumlah (amount), dan tanggal (date) wajib diisi!",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Jumlah (amount) harus lebih dari 0",
      });
    }

    const result = await createTransactionService(firebaseUid, {
      categoryId,
      amount,
      date,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil dicatat dan saldo telah diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Error Create Transaction: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal membuat transaksi",
    });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const transactions = await getUserTransactionsServie(firebaseUid);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error Get Transactions: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil riwayat transaksi",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { id } = req.params; // Ambil ID transaksi dari URL

    const result = await deleteTransactionService(firebaseUid, id);

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil dihapus dan saldo telah disesuaikan",
      data: result,
    });
  } catch (error) {
    console.error("Error Delete Transaction: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus transaksi",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { id } = req.params;
    const { categoryId, amount, date, description } = req.body;

    if (!categoryId || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Kategori, jumlah, dan tanggal wajib diisi!",
      });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Jumlah harus lebih dari 0" });
    }

    const result = await updateTransactionService(firebaseUid, id, {
      categoryId,
      amount,
      date,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil diubah dan saldo telah disesuaikan",
      data: result,
    });
  } catch (error) {
    console.error("Error Update Transaction: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengubah transaksi",
    });
  }
};
