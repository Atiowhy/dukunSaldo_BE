import prisma from "../config/prisma.js";

export const createTransactionService = async (firebaseUid, data) => {
  // ambil categoryid, amount, date, description dari req.data
  const { categoryId, amount, date, description } = data;

  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Kategori tidak ditemukan");
  }

  const balanceChange = category.type === "INCOME" ? amount : -amount;

  const result = await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        amount: amount,
        date: new Date(date),
        description: description || "",
      },
      include: {
        category: true,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    return { transaction: newTransaction, currentBalance: updatedUser.balance };
  });

  return result;
};

export const getUserTransactionsServie = async (firebaseUid) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: {
      category: true,
    },
  });
};

export const updateTransactionService = async (
  firebaseUid,
  transactionId,
  updateData,
) => {
  const { categoryId, amount, date, description } = updateData;

  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // cari transaksi lama
  const oldTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true },
  });

  if (!oldTransaction) throw new Error("Transaksi tidak ditemukan");
  if (oldTransaction.userId !== user.id) throw new Error("Akses ditolak!");

  // cari kategori baru
  const newCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!newCategory) throw new Error("Kategori baru tidak ditemukan");

  // hitung dampak lama dan dampak baru terhadap saldo
  const oldImpact =
    oldTransaction.category.type === "INCOME"
      ? oldTransaction.amount
      : -oldTransaction.amount;
  const newImpact = newCategory.type === "INCOME" ? amount : -amount;

  // hitung selisihnya
  const balanceChange = newImpact - oldImpact;

  // eksekusi update transaksi
  return await prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId,
        amount,
        date: new Date(date),
        description: description || "",
      },
      include: { category: true },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { balance: { increment: balanceChange } },
    });

    return {
      transaction: updatedTransaction,
      currentBalance: updatedUser.balance,
    };
  });
};

export const deleteTransactionService = async (firebaseUid, transactionId) => {
  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) throw new Error("User tidak ditemukan");

  // 1. Cari transaksi lama beserta kategorinya
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true },
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan");
  if (transaction.userId !== user.id)
    throw new Error("Akses ditolak. Ini bukan transaksimu!");

  // 2. Hitung dampak transaksi lama (jika INCOME positif, jika EXPENSE negatif)
  const oldImpact =
    transaction.category.type === "INCOME"
      ? transaction.amount
      : -transaction.amount;

  // 3. Karena dihapus, kita harus membalikkan dampak tersebut
  // (Kalau dulu nambah, sekarang dikurangi. Kalau dulu ngurang, sekarang ditambah)
  const reverseImpact = -oldImpact;

  // 4. Eksekusi proses hapus dan update saldo secara atomik
  return await prisma.$transaction(async (tx) => {
    const deletedTransaction = await tx.transaction.delete({
      where: { id: transactionId },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { balance: { increment: reverseImpact } },
    });

    return { deletedTransaction, currentBalance: updatedUser.balance };
  });
};
