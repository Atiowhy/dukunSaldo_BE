import { mockLoginService } from "../services/authServices.js";

export const mockLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email dan Nama wajib diisi",
      });
    }

    const authData = mockLoginService(email, name);

    res.status(201).json({
      success: true,
      message: "Mock Login Berhasil",
      data: authData,
    });
  } catch (error) {
    console.error("Error Mock Login Controller: ", error);
    res.status(500).json({
      success: false,
      message: "Gagal melakukan login",
    });
  }
};
