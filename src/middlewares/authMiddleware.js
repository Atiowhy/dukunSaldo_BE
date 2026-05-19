// src/middlewares/authMiddleware.js SAAT INI
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  // Membongkar token buatan kita sendiri
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded; // Isinya: { firebaseUid: "MOCK-123", email: "..." }
  next();
};
