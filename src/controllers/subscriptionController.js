// src/controllers/subscriptionController.js
import {
  createSubscriptionService,
  getUserSubscriptionsService,
} from "../services/subscriptionService.js";

export const createSubscription = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { name, amount, dueDate, isActive } = req.body;

    // Validasi input
    if (!name || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Nama langganan, jumlah (amount), dan tanggal jatuh tempo (dueDate) wajib diisi!",
      });
    }

    const newSubscription = await createSubscriptionService(firebaseUid, {
      name,
      amount,
      dueDate,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Langganan berhasil dicatat",
      data: newSubscription,
    });
  } catch (error) {
    console.error("Error Create Subscription: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal membuat langganan",
    });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const subscriptions = await getUserSubscriptionsService(firebaseUid);

    res.status(200).json({
      success: true,
      message: "Data langganan berhasil diambil",
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error Get Subscriptions: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data langganan",
    });
  }
};
