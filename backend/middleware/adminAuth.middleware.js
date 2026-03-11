import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const adminAuth = async (req, res, next) => {

  try {

    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: "Invalid admin token" });
    }

    req.admin = admin;

    next();

  } catch (error) {

    console.error(error);
    return res.status(401).json({ error: "Admin authentication failed" });

  }

};