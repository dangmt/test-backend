// Trong file routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getProducts,
  getProductById, // Nhớ import hàm này
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Các route khác giữ nguyên
router.post("/", verifyToken, addProduct);
router.get("/", getProducts);
router.put("/:id", verifyToken, isOwnerOrAdmin, updateProduct);
router.delete("/:id", verifyToken, isOwnerOrAdmin, deleteProduct);

// Thêm route mới cho việc lấy sản phẩm bằng ID
router.get("/:id", getProductById); // Không yêu cầu xác thực để xem thông tin sản phẩm

export default router;
