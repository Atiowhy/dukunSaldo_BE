// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import predictionRoutes from "./src/routes/predictionRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routing
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// 6. Menyalakan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `[SERVER] Menyala dan berjalan mulus di http://localhost:${PORT}`,
  );
});
