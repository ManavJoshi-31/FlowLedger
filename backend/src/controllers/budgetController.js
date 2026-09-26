import Budget from "../models/Budget.js";
import Organization from "../models/Organization.js";
import Department from "../models/Department.js";
import mongoose from "mongoose";

export const createBudget = async (req, res) => {
  try {
    const { departmentId, totalAmount, period } = req.body;
    const organizationId = req.user.organizationId;

    if (
      !departmentId ||
      totalAmount === undefined ||
      !period?.startDate ||
      !period?.endDate
    ) {
      return res.status(400).json({
        message: "Required budget fields are missing",
      });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    if (department.organizationId.toString() !== organizationId.toString()) {
      return res.status(400).json({
        message: "Department does not belong to this organization",
      });
    }

    if (Number(totalAmount) < 0) {
      return res.status(400).json({
        message: "Total amount cannot be negative",
      });
    }

    if (new Date(period.startDate) >= new Date(period.endDate)) {
      return res.status(400).json({
        message: "Budget start date must be before end date",
      });
    }

    const existingBudget = await Budget.findOne({
      organizationId,
      departmentId,
      "period.startDate": new Date(period.startDate),
      "period.endDate": new Date(period.endDate),
    });

    if (existingBudget) {
      return res.status(409).json({
        message: "Budget already exists for this department and period",
      });
    }

    const budget = await Budget.create({
      organizationId,
      departmentId,
      totalAmount,
      period,
    });

    return res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Create budget error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    let filter = {
      organizationId,
    };

    if (req.user.role === "DEPARTMENT_MANAGER") {
      const department = await Department.findOne({
        managerId: req.user.userId,
        organizationId,
      });

      if (!department) {
        return res.status(404).json({
          message: "Department managed by user not found",
        });
      }

      filter.departmentId = department._id;
    }

    const budgets = await Budget.find(filter);

    return res.status(200).json({
      message: "Budgets fetched successfully",
      budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getBudgetById = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const organizationId = req.user.organizationId;
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }
    const budget = await Budget.findById(budgetId);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    // Organization isolation
    if (budget.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to access this budget",
      });
    }

    // Department Manager can only access their department's budget
    if (req.user.role === "DEPARTMENT_MANAGER") {
      const department = await Department.findOne({
        managerId: req.user.userId,
        organizationId,
      });

      if (!department) {
        return res.status(404).json({
          message: "Department managed by user not found",
        });
      }

      if (budget.departmentId.toString() !== department._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to access this budget",
        });
      }
    }

    return res.status(200).json({
      message: "Budget fetched successfully",
      budget,
    });
  } catch (error) {
    console.error("Get budget error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { totalAmount, period } = req.body;
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }
    const organizationId = req.user.organizationId;

    const budget = await Budget.findById(budgetId);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    if (budget.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this budget",
      });
    }

    if (budget.status === "CLOSED") {
      return res.status(400).json({
        message: "Closed budget cannot be updated",
      });
    }

    if (totalAmount !== undefined) {
      if (Number(totalAmount) < 0) {
        return res.status(400).json({
          message: "Total amount cannot be negative",
        });
      }
      if (Number(totalAmount) < Number(budget.usedAmount)) {
        return res.status(400).json({
          message: "Total amount cannot be less than used amount",
        });
      }
      budget.totalAmount = totalAmount;
    }

    if (period !== undefined) {
      const startDate =
        period.startDate !== undefined
          ? new Date(period.startDate)
          : budget.period.startDate;
      const endDate =
        period.endDate !== undefined
          ? new Date(period.endDate)
          : budget.period.endDate;
      if (startDate >= endDate) {
        return res.status(400).json({
          message: "Budget start date must be before end date",
        });
      }
      const existingBudget = await Budget.findOne({
        organizationId,
        departmentId: budget.departmentId,
        "period.startDate": startDate,
        "period.endDate": endDate,
        //Because when updating a budget, MongoDB could find the budget we're currently editing.
        _id: { $ne: budgetId },
      });

      if (existingBudget) {
        return res.status(409).json({
          message: "Budget already exists for this department and period",
        });
      }
      budget.period.startDate = startDate;
      budget.period.endDate = endDate;
    }

    await budget.save();

    return res.status(200).json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Update budget error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const closeBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const organizationId = req.user.organizationId;
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }
    const budget = await Budget.findById(budgetId);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    if (budget.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to close this budget",
      });
    }

    if (budget.status === "CLOSED") {
      return res.status(400).json({
        message: "Budget is already closed",
      });
    }

    budget.status = "CLOSED";

    await budget.save();

    return res.status(200).json({
      message: "Budget closed successfully",
      budget,
    });
  } catch (error) {
    console.error("Close budget error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
