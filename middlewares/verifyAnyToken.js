import jwt from "jsonwebtoken";
import Admin from "../models/adminAuthSchema.js";
import Employee from "../models/employeeSchema.js";
import User from "../models/user.js";

/**
 * Middleware that verifies and authenticates Admin, Employee, or User tokens
 * Sets req.user, and optionally req.admin or req.employee based on token type
 */
export const verifyAnyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find admin first
    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.user = admin;
      req.admin = admin;
      return next();
    }

    // Try to find employee
    const employee = await Employee.findById(decoded.id).populate("roleId");
    if (employee) {
      req.user = employee;
      req.employee = employee;
      return next();
    }

    // Try to find regular user
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }

    // No matching user found
    return res.status(401).json({ message: "Invalid token - user not found" });

  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};
