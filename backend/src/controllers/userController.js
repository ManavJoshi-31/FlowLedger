import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Department from "../models/Department.js";
import { hashPassword } from "../utils/password.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, departmentId } = req.body;

    const organizationId = req.user.organizationId;
    const creatorRole = req.user.role;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // 3. Department Manager can create EMPLOYEE only
    if (creatorRole === "DEPARTMENT_MANAGER" && role !== "EMPLOYEE") {
      return res.status(403).json({
        message: "Department Manager can create employees only",
      });
    }

    // 4. Department Manager must have a department
    let managerDepartmentId = null;

    if (creatorRole === "DEPARTMENT_MANAGER") {
      const managerDepartment = await Department.findOne({
        managerId: req.user.userId,
        organizationId,
      });

      if (!managerDepartment) {
        return res.status(400).json({
          message: "Department Manager is not assigned to a department",
        });
      }

      managerDepartmentId = managerDepartment._id;
    }

    // 5. Determine department
    let assignedDepartmentId = departmentId;

    if (creatorRole === "DEPARTMENT_MANAGER") {
      assignedDepartmentId = managerDepartmentId;
    }

    // 6. Department is required for employees
    if (role === "EMPLOYEE" && !assignedDepartmentId) {
      return res.status(400).json({
        message: "Employee must be assigned to a department",
      });
    }

    // 7. Validate department
    if (assignedDepartmentId) {
      const department = await Department.findById(assignedDepartmentId);

      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      if (department.organizationId.toString() !== organizationId.toString()) {
        return res.status(403).json({
          message: "Department does not belong to your organization",
        });
      }

      // Department Manager can only use their own department
      if (
        creatorRole === "DEPARTMENT_MANAGER" &&
        department._id.toString() !== managerDepartmentId.toString()
      ) {
        return res.status(403).json({
          message:
            "Department Manager can create users only in their own department",
        });
      }
    }

    // 8. Hash password
    const passwordHash = await hashPassword(password);

    // 9. Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      organizationId,
      departmentId: assignedDepartmentId,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, departmentId, status } = req.body;

    // 1. Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. User must belong to the admin's organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this user",
      });
    }

    // 3. Update name
    if (name !== undefined) {
      user.name = name;
    }

    // 4. Update email
    if (email !== undefined) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        });
      }

      user.email = email;
    }

    // 5. Update department
    if (departmentId !== undefined) {
      const department = await Department.findById(departmentId);

      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      // Department must belong to same organization
      if (
        department.organizationId.toString() !==
        req.user.organizationId.toString()
      ) {
        return res.status(400).json({
          message: "Department does not belong to your organization",
        });
      }

      user.departmentId = departmentId;
    }

    // 6. Update status
    if (status !== undefined) {
      user.status = status;
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
