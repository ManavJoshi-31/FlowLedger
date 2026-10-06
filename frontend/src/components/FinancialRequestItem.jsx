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
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

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
    const remarks = rejectionRemarks.trim();

    if (!remarks) {
      setActionError("Rejection remarks are required.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const data = await rejectFinancialRequest(request._id, remarks);

      onRequestUpdated(data.financialRequest);

      setRejectionRemarks("");
      setShowRejectForm(false);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to reject financial request",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReject = () => {
    setRejectionRemarks("");
    setActionError("");
    setShowRejectForm(false);
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

      {canReview && !showRejectForm && (
        <div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Approve"}
          </button>

          <button
            type="button"
            onClick={() => {
              setActionError("");
              setShowRejectForm(true);
            }}
            disabled={actionLoading}
          >
            Reject
          </button>
        </div>
      )}

      {canReview && showRejectForm && (
        <div>
          <label htmlFor={`rejection-${request._id}`}>Rejection Reason</label>

          <textarea
            id={`rejection-${request._id}`}
            value={rejectionRemarks}
            onChange={(event) => setRejectionRemarks(event.target.value)}
            placeholder="Enter the reason for rejecting this request"
            disabled={actionLoading}
          />

          <button type="button" onClick={handleReject} disabled={actionLoading}>
            {actionLoading ? "Rejecting..." : "Confirm Rejection"}
          </button>

          <button
            type="button"
            onClick={handleCancelReject}
            disabled={actionLoading}
          >
            Cancel
          </button>
        </div>
      )}

      {actionError && <p>{actionError}</p>}
    </div>
  );
}

export default FinancialRequestItem;
