import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { hashPassword } from "../utils/password.js";

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

    // 1. Validate required fields
    if (!name || !email || !password || !role || !organizationId) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    // 2. Check whether organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found"
      });
    }

    // 3. Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    // 4. Hash password before storing it
    const passwordHash = await hashPassword(password);

    // 5. Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      organizationId,
      departmentId
    });

    // 6. Never return passwordHash
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