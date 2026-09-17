import FinancialRequest from "../models/FinancialRequest.js";
import Budget from "../models/Budget.js";
import User from "../models/User.js";
export const createFinancialRequest = async (req, res) => {
  try {
    const { budgetId, title, description, amount, category } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;
    // 1. Validate required fields
    if (
      !budgetId ||
      !title ||
      !description ||
      amount === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: "Required financial request fields are missing",
      });
    }
    // 2. Find authenticated user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. User must be active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Inactive users cannot create financial requests",
      });
    }

    // 4. User must belong to a department
    if (!user.departmentId) {
      return res.status(400).json({
        message: "User is not assigned to a department",
      });
    }

    // 5. Validate amount
    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Request amount must be greater than zero",
      });
    }

    // 6. Find budget
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }
    // 7. Organization isolation
    if (budget.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "Budget does not belong to your organization",
      });
    }
    // 8. Budget must belong to user's department
    if (budget.departmentId.toString() !== user.departmentId.toString()) {
      return res.status(403).json({
        message: "Budget does not belong to your department",
      });
    }

    // 9. Budget must be active
    if (budget.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cannot create request against a closed budget",
      });
    }
    // 10. Check budget availability
    const availableAmount =
      Number(budget.totalAmount) - Number(budget.usedAmount);
    let status = "PENDING";
    if (Number(amount) > availableAmount) {
      status = "DRAFT";
    }
    // 11. Create financial request
    const financialRequest = await FinancialRequest.create({
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      requestedBy: user._id,
      budgetId,
      title,
      description,
      amount,
      category,
      status,
      submittedAt: status === "PENDING" ? new Date() : undefined,
    });

    return res.status(201).json({
      message:
        status === "PENDING"
          ? "Financial request submitted successfully"
          : "Budget limit exceeded. Request saved as draft",
      financialRequest,
    });
  } catch (error) {
    console.error("Create financial request error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
