import Department from "../models/Department.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

export const createDepartment = async (req, res) => {
  try {
    const { organizationId, name, description, managerId } = req.body;

    if (!organizationId || !name || !managerId) {
      return res.status(400).json({
        message: "Organization ID,department name and Manager ID are required",
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization Not found",
      });
    }
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }
    if (manager.organizationId.toString() !== organizationId) {
      return res.status(400).json({
        message: "Manager is not part of this organization",
      });
    }

    if (manager.role !== "DEPARTMENT_MANAGER") {
      return res.status(400).json({
        message: "User is not a department manager",
      });
    }
    if (manager.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Manager is not active",
      });
    }

    const existingDepartment = await Department.findOne({
      organizationId,
      name,
    });

    if (existingDepartment) {
      return res.status(409).json({
        message: "Department with this name already exists in the organization",
      });
    }
    const department = await Department.create({
      organizationId,
      name,
      description,
      managerId,
    });
    await User.findByIdAndUpdate(managerId, {
      departmentId: department._id,
    });
    return res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
