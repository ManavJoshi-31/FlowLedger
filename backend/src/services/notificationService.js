import Notification from "../models/Notification.js";
import Department from "../models/Department.js";

export const notifyRequestSubmitted = async (financialRequest) => {
  // Find the department that owns the request
  const department = await Department.findById(financialRequest.departmentId);

  if (!department) {
    throw new Error("Department associated with request not found");
  }

  // The department manager is the recipient
  const notification = await Notification.create({
    userId: department.managerId,
    type: "REQUEST_SUBMITTED",
    title: "New Financial Request",
    message: `New financial request "${financialRequest.title}" requires your review.`,
    requestId: financialRequest._id,
    isRead: false,
  });

  return notification;
};
export const notifyRequestApproved = async (financialRequest) => {
  const notification = await Notification.create({
    userId: financialRequest.requestedBy,
    type: "REQUEST_APPROVED",
    title: "Financial Request Approved",
    message: `Your financial request "${financialRequest.title}" has been approved.`,
    requestId: financialRequest._id,
    isRead: false,
  });

  return notification;
};
