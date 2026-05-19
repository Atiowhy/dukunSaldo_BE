import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";

export const mockLoginService = async (email, name) => {
  // cek apakah user ada di db
  // jika belum ada buat user baru dengan UID tiruan
  // buat jwt token
  // kembalikan data user dan token ke controller

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const mockFireBaseId = "MOCK-UID-" + Math.floor(Math.random() * 1000000);

    user = await prisma.user.create({
      data: {
        firebaseUid: mockFireBaseId,
        name: name,
        email: email,
        balance: 0.0,
      },
    });
  }
  const token = jwt.sign(
    {
      firebaseUid: user.firebaseUid,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { user, token };
};
