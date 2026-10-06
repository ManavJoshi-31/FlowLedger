import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import {
  approveFinancialRequest,
  rejectFinancialRequest,
} from "../services/financialRequestService";
import "./FinancialRequestItem.css";

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="badge badge-approved">Approved</span>;
      case "REJECTED":
        return <span className="badge badge-rejected">Rejected</span>;
      case "PENDING":
        return <span className="badge badge-pending">Pending</span>;
      default:
        return <span className="badge badge-draft">{status}</span>;
    }
  };

  const getItemClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "request-item-approved";
      case "REJECTED":
        return "request-item-rejected";
      case "PENDING":
        return "request-item-pending";
      default:
        return "";
    }
  };

  return (
    <article className={`financial-request-item ${getItemClass(request.status)}`}>
      <div className="financial-request-header">
        <div className="financial-request-title-area">
          <div className="financial-request-badges">
            <span className="category-tag">{request.category}</span>
            {getStatusBadge(request.status)}
          </div>
          <h3 className="financial-request-title">{request.title}</h3>
        </div>

        <div className="financial-request-amount-box">
          <span className="amount-label">Amount</span>
          <span className="amount-value">₹{Number(request.amount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {request.description && (
        <p className="financial-request-description">{request.description}</p>
      )}

      {request.rejectionRemarks && (
        <div className="rejection-remarks-box">
          <div className="rejection-remarks-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Rejection Remarks</span>
          </div>
          <p style={{ margin: 0 }}>{request.rejectionRemarks}</p>
        </div>
      )}

      <div className="financial-request-footer">
        <span className="request-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Created on {new Date(request.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}</span>
        </span>

        {canReview && !showRejectForm && (
          <div className="financial-request-actions">
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Approve"}
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm"
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
      </div>

      {canReview && showRejectForm && (
        <div className="reject-form-panel">
          <label htmlFor={`rejection-${request._id}`} className="reject-form-label">
            Reason for Rejection *
          </label>

          <textarea
            id={`rejection-${request._id}`}
            className="reject-form-textarea"
            value={rejectionRemarks}
            onChange={(event) => setRejectionRemarks(event.target.value)}
            placeholder="Explain specifically why this financial request is being rejected"
            disabled={actionLoading}
          />

          <div className="reject-form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelReject}
              disabled={actionLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error" style={{ marginTop: "0.5rem" }} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{actionError}</span>
        </div>
      )}
    </article>
  );
}

export default FinancialRequestItem;
