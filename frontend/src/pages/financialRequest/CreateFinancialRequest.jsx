import { useState } from "react";
import { Link } from "react-router-dom";
import { createFinancialRequest } from "../../services/financialRequestService";
import "./CreateFinancialRequest.css";

function CreateFinancialRequest() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Please enter a request title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const amount = Number(formData.amount);

    if (!formData.amount) {
      setError("Please enter a request amount.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(amount)) {
      setError("Amount must be a whole number.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createFinancialRequest({
        ...formData,
        amount,
      });

      setSuccess(data.message || "Financial request submitted successfully.");
      setFormData({
        title: "",
        description: "",
        amount: "",
        category: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create financial request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div>
        <Link to="/dashboard" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div className="page-header-content">
            <h1 className="page-title">Create Financial Request</h1>
            <p className="page-subtitle">
              Submit a financial disbursement request for departmental manager approval
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Request Title */}
          <div className="form-field">
            <label htmlFor="title">Request Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Q3 Software licenses for engineering team"
              required
            />
          </div>

          <div className="form-grid-2col">
            {/* Category */}
            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="PURCHASE">Purchase</option>
                <option value="TRAVEL">Travel</option>
                <option value="REIMBURSEMENT">Reimbursement</option>
                <option value="TRAINING">Training</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Amount */}
            <div className="form-field">
              <label htmlFor="amount">Requested Amount (₹) *</label>
              <div className="input-with-affix">
                <span className="input-prefix" aria-hidden="true">₹</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="25000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-field">
            <label htmlFor="description">Business Justification &amp; Details *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context, vendor information, and business reason for this expense..."
              rows={5}
              required
            />
            <p className="form-helper-text">
              Detailed descriptions expedite manager review and budget matching.
            </p>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }}></span>
                  <span>Submitting Request...</span>
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFinancialRequest;
