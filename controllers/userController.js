import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering the user:", error.message);

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "2h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
    });

    res.status(200).json({ userId: user._id, role: user.role });
  } catch (error) {
    console.error("Error logging in the user:", error.message);

    res.status(500).json({ message: error.message });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Đăng xuất thành công" });
};
export const checkSession = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "No session found" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Tìm và trả về thông tin người dùng nếu cần
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // Trả về thông tin người dùng cần thiết hoặc chỉ đơn giản là trạng thái đăng nhập
        res.status(200).json({ userId: user._id, role: user.role });
      })
      .catch((err) =>
        res
          .status(500)
          .json({ message: "Internal server error", error: err.message })
      );
  });
};
