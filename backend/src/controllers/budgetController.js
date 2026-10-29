import Budget from "../models/Budget.js";
import Organization from "../models/Organization.js";
import Department from "../models/Department.js";
import mongoose from "mongoose";

/**
 * Helper to check whether a budget with the exact same start & end dates
 * or the same fiscal year (start YYYY to end YYYY) already exists for the department.
 */
const findConflictingBudget = async ({
  organizationId,
  departmentId,
  startDate,
  endDate,
  excludeBudgetId = null,
}) => {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return { invalidDates: true };
  }

  const newStartDay = newStart.toISOString().split("T")[0];
  const newEndDay = newEnd.toISOString().split("T")[0];
  const newStartYear = newStart.getUTCFullYear();
  const newEndYear = newEnd.getUTCFullYear();

  const query = {
    organizationId,
    departmentId,
  };

  if (excludeBudgetId) {
    query._id = { $ne: excludeBudgetId };
  }

  const departmentBudgets = await Budget.find(query);

  for (const existing of departmentBudgets) {
    const exStart = new Date(existing.period.startDate);
    const exEnd = new Date(existing.period.endDate);

    const exStartDay = exStart.toISOString().split("T")[0];
    const exEndDay = exEnd.toISOString().split("T")[0];
    const exStartYear = exStart.getUTCFullYear();
    const exEndYear = exEnd.getUTCFullYear();

    // 1. Same exact start and end date
    const isSameDate = exStartDay === newStartDay && exEndDay === newEndDay;

    // 2. Same fiscal year (start YYYY and end YYYY match)
    const isSameFiscalYear =
      exStartYear === newStartYear && exEndYear === newEndYear;

    if (isSameDate || isSameFiscalYear) {
      const fyiYear =
        newStartYear === newEndYear
          ? `${newStartYear}`
          : `${newStartYear}–${newEndYear}`;
      return {
        conflict: true,
        conflictingBudget: existing,
        fyiYear,
        reason: isSameDate ? "same_dates" : "same_fiscal_year",
      };
    }
  }

  return { conflict: false };
};

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

    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid budget period dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Budget start date must be before end date",
      });
    }

    const conflictCheck = await findConflictingBudget({
      organizationId,
      departmentId,
      startDate: period.startDate,
      endDate: period.endDate,
    });

    if (conflictCheck.conflict) {
      return res.status(409).json({
        message: `Budget already exists for this fiscal year (${conflictCheck.fyiYear}), you can update that.`,
        existingBudgetId: conflictCheck.conflictingBudget._id,
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

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          message: "Invalid budget period dates",
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({
          message: "Budget start date must be before end date",
        });
      }

      const conflictCheck = await findConflictingBudget({
        organizationId,
        departmentId: budget.departmentId,
        startDate,
        endDate,
        excludeBudgetId: budgetId,
      });

      if (conflictCheck.conflict) {
        return res.status(409).json({
          message: `Budget already exists for this fiscal year (${conflictCheck.fyiYear}), you can update that.`,
          existingBudgetId: conflictCheck.conflictingBudget._id,
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
