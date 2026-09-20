import FinancialRequest from "../models/FinancialRequest.js";
import Budget from "../models/Budget.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Approval from "../models/Approval.js";
import { notifyRequestSubmitted } from "../services/notificationService.js";
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

    if (status === "PENDING") {
      await notifyRequestSubmitted(financialRequest);
    }

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
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const department = await Department.findOne({
      managerId: userId,
      organizationId,
    });

    if (!department) {
      return res.status(400).json({
        message: "Department Manager is not assigned to a department",
      });
    }

    const requests = await FinancialRequest.find({
      organizationId,
      departmentId: department._id,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Pending financial requests fetched successfully",
      requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const approveFinancialRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { remarks } = req.body;

    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    // Find the request
    const financialRequest = await FinancialRequest.findById(requestId);

    if (!financialRequest) {
      return res.status(404).json({
        message: "Financial request not found",
      });
    }

    // Make sure the request belongs to the manager's organization
    if (
      financialRequest.organizationId.toString() !== organizationId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to approve this request",
      });
    }

    // Request must currently be pending
    if (financialRequest.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending requests can be approved",
      });
    }

    // Find the department managed by the authenticated user
    const department = await Department.findOne({
      managerId: userId,
      organizationId,
    });

    if (!department) {
      return res.status(400).json({
        message: "Department Manager is not assigned to a department",
      });
    }

    // Make sure the request belongs to the manager's department
    if (
      financialRequest.departmentId.toString() !== department._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to approve requests from this department",
      });
    }

    // Create approval record
    const approval = await Approval.create({
      requestId: financialRequest._id,
      reviewerId: userId,
      level: 1,
      decision: "APPROVED",
      remarks,
      decidedAt: new Date(),
    });

    // Update request status
    financialRequest.status = "APPROVED";
    await financialRequest.save();

    return res.status(200).json({
      message: "Financial request approved successfully",
      financialRequest,
      approval,
    });
  } catch (error) {
    console.error("Approve financial request error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const rejectFinancialRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { remarks } = req.body;

    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const financialRequest = await FinancialRequest.findById(requestId);

    if (!financialRequest) {
      return res.status(404).json({
        message: "Financial request not found",
      });
    }

    if (
      financialRequest.organizationId.toString() !== organizationId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to reject this request",
      });
    }

    if (financialRequest.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending requests can be rejected",
      });
    }

    const department = await Department.findOne({
      managerId: userId,
      organizationId,
    });

    if (!department) {
      return res.status(400).json({
        message: "Department Manager is not assigned to a department",
      });
    }

    if (
      financialRequest.departmentId.toString() !== department._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to reject requests from this department",
      });
    }

    const approval = await Approval.create({
      requestId: financialRequest._id,
      reviewerId: userId,
      level: 1,
      decision: "REJECTED",
      remarks,
      decidedAt: new Date(),
    });

    financialRequest.status = "REJECTED";
    await financialRequest.save();

    return res.status(200).json({
      message: "Financial request rejected successfully",
      financialRequest,
      approval,
    });
  } catch (error) {
    console.error("Reject financial request error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
