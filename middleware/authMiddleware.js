import Product from "../models/Product.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    // Nếu không tìm thấy user, trả về lỗi
    // console.log(req.user);
    return res.status(404).json({ message: "User not found" });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin role required" });
  }
  next();
};

export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.equals(req.user.id) || req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to perform this action" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
