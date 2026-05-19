import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  console.log("Memulai proses seeding kategori...");

  const defaultCategories = [
    // --- PEMASUKAN (INCOME) ---
    { name: "Gaji & Pendapatan", type: "INCOME" },
    { name: "Bonus & THR", type: "INCOME" },
    { name: "Hasil Investasi", type: "INCOME" },

    // --- PENGELUARAN (EXPENSE) ---
    { name: "Makanan & Minuman", type: "EXPENSE" },
    { name: "Transportasi & Bensin", type: "EXPENSE" },
    { name: "Tagihan & Utang", type: "EXPENSE" },
    { name: "Belanja & Kebutuhan Harian", type: "EXPENSE" },
    { name: "Hiburan & Hobi", type: "EXPENSE" },
    { name: "Kesehatan & Asuransi", type: "EXPENSE" },
  ];

  for (const category of defaultCategories) {
    await prisma.category.create({
      data: category,
    });
    console.log(`"kategori ditambahkan: ${category.name} [${category.type}]"`);
  }
  console.log("Seeding selesai! 🚀");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
