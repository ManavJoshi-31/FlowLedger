import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartments } from "../services/departmentService";
import { createBudget } from "../services/budgetService";
import "./Forms.css";

function CreateBudget() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: "",
    totalAmount: "",
    startDate: "",
    endDate: "",
  });

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const data = await getDepartments();

        setDepartments(data.departments);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

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

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.totalAmount) {
      setError("Please enter a total budget amount.");
      return;
    }

    const totalAmount = Number(formData.totalAmount);

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      setError("Budget amount cannot be negative.");
      return;
    }

    if (!Number.isInteger(totalAmount)) {
      setError("Budget amount must be a whole number.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Please select both budget dates.");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createBudget({
        departmentId: formData.departmentId,
        totalAmount,
        period: {
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      });

      setSuccess(data.message || "Budget created successfully.");

      setFormData({
        departmentId: "",
        totalAmount: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div>
        <Link to="/budgets" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Budgets</span>
        </Link>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div className="page-header-content">
            <h1 className="page-title">Create Budget</h1>
            <p className="page-subtitle">
              Allocate funds and establish date boundaries for a department
            </p>
          </div>
        </div>
      </div>

      {loadingDepartments && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          <span>Loading departments...</span>
        </div>
      )}

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

      {!loadingDepartments && (
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="departmentId">Department *</label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">Select target department</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="totalAmount">Total Budget Amount (₹) *</label>
              <div className="input-with-affix">
                <span className="input-prefix" aria-hidden="true">₹</span>
                <input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="500000"
                  required
                />
              </div>
              <p className="form-helper-text">Enter whole rupee amount with no decimals.</p>
            </div>

            <div className="form-grid-2col">
              <div className="form-field">
                <label htmlFor="startDate">Fiscal Start Date *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="endDate">Fiscal End Date *</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <Link to="/budgets" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16 }}></span>
                    <span>Creating Budget...</span>
                  </>
                ) : (
                  "Create Budget"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateBudget;
