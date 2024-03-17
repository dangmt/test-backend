import express from "express";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import { Database, Resource } from "@adminjs/mongoose";

dotenv.config();

// Đăng ký adapter Mongoose với AdminJS
AdminJS.registerAdapter({ Database, Resource });

const adminJs = new AdminJS({
  databases: [mongoose],
  rootPath: "/admin",
  resources: [
    { resource: User, options: { parent: { name: "User Data" } } },
    { resource: Product, options: { parent: { name: "Product Data" } } },
  ],
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Cho phép truy cập từ nguồn gốc này
  })
);
// Tạo router cho AdminJS sử dụng buildRouter từ @adminjs/express
const router = AdminJSExpress.buildRouter(adminJs);

app.use(adminJs.options.rootPath, router);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use("/api", userRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
