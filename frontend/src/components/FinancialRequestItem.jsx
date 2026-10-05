import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import {
  approveFinancialRequest,
  rejectFinancialRequest,
} from "../services/financialRequestService";

function FinancialRequestItem({ request, onRequestUpdated }) {
  const { user } = useContext(AuthContext);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canReview =
    user?.role === "DEPARTMENT_MANAGER" && request.status === "PENDING";

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setActionError("");

      const data = await approveFinancialRequest(request._id);

      onRequestUpdated(data.financialRequest);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to approve financial request",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      setActionError("");

      const data = await rejectFinancialRequest(request._id);

      onRequestUpdated(data.financialRequest);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to reject financial request",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h3>{request.title}</h3>

      <p>Amount: ₹{Number(request.amount).toLocaleString("en-IN")}</p>

      <p>Category: {request.category}</p>

      <p>Status: {request.status}</p>

      <small>
        Created: {new Date(request.createdAt).toLocaleDateString("en-IN")}
      </small>

      {canReview && (
        <div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Approve"}
          </button>

          <button type="button" onClick={handleReject} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Reject"}
          </button>
        </div>
      )}

      {actionError && <p>{actionError}</p>}
    </div>
  );
}

export default FinancialRequestItem;
