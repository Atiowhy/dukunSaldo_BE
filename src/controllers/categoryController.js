import { getAllCategoriesService } from "../services/categoryServices.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error Get Categories: ", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal Mengambil Data Kategori" });
  }
};
