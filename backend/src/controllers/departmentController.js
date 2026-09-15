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
export const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description, status, managerId } = req.body;

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    if (
      department.organizationId.toString() !==
      req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this department",
      });
    }
    // Update department name
    if (name !== undefined) {
      const existingDepartment = await Department.findOne({
        organizationId: req.user.organizationId,
        name,
        _id: { $ne: departmentId },
      });

      if (existingDepartment) {
        return res.status(409).json({
          message:
            "Department with this name already exists in the organization",
        });
      }
      department.name = name;
    }

    // Update description
    if (description !== undefined) {
      department.description = description;
    }

    // Update status
    if (status !== undefined) {
      department.status = status;
    }

    // Update department manager
    if (managerId !== undefined) {
      const newManager = await User.findById(managerId);

      if (!newManager) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      // Manager must belong to the same organization
      if (
        newManager.organizationId.toString() !==
        req.user.organizationId.toString()
      ) {
        return res.status(400).json({
          message: "Manager does not belong to this organization",
        });
      }

      // Manager must have the correct role
      if (newManager.role !== "DEPARTMENT_MANAGER") {
        return res.status(400).json({
          message: "User is not a department manager",
        });
      }

      // Manager must be active
      if (newManager.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Manager is not active",
        });
      }

      // Manager cannot already manage another department
      const managedDepartment = await Department.findOne({
        managerId,
        _id: { $ne: departmentId },
      });

      if (managedDepartment) {
        return res.status(409).json({
          message: "Manager is already assigned to another department",
        });
      }

      const oldManagerId = department.managerId;

      // Manager is actually changing
      if (oldManagerId.toString() !== managerId.toString()) {
        // Remove department from old manager
        await User.findByIdAndUpdate(oldManagerId, {
          $unset: { departmentId: "" },
        });

        // Assign department to new manager
        await User.findByIdAndUpdate(managerId, {
          departmentId: department._id,
        });

        // Update department's manager
        department.managerId = managerId;
      } else {
        // Same manager: ensure relationship is synchronized
        await User.findByIdAndUpdate(managerId, {
          departmentId: department._id,
        });
      }
    }

    await department.save();

    return res.status(200).json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
