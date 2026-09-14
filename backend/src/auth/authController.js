import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      organizationId,
      departmentId
    } = req.body;

    if (!name || !email || !password || !role || !organizationId) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      organizationId,
      departmentId
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "User account is inactive"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        organizationId: user.organizationId,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};