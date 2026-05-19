import prisma from "../config/prisma.js";

export const getAllCategoriesService = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};
