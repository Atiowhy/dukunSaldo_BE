// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Menyalakan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `[SERVER] Menyala dan berjalan mulus di http://localhost:${PORT}`,
  );
});
