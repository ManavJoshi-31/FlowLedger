import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartments } from "../services/departmentService";
import { getBudgets, createBudget, updateBudget } from "../services/budgetService";
import "./Forms.css";

function CreateBudget() {
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    departmentId: "",
    totalAmount: "",
    startDate: "",
    endDate: "",
  });

  // Update mode state
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedExistingBudget, setSelectedExistingBudget] = useState(null);
  const [conflictBudget, setConflictBudget] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [deptData, budgetsData] = await Promise.all([
          getDepartments(),
          getBudgets().catch(() => ({ budgets: [] })),
        ]);

        if (isMounted) {
          setDepartments(deptData.departments || []);
          setBudgets(budgetsData.budgets || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (name === "departmentId") {
      setConflictBudget(null);
      if (isUpdateMode) {
        setIsUpdateMode(false);
        setSelectedExistingBudget(null);
      }
    }
  };

  // Find existing budgets for current selected department
  const departmentBudgets = formData.departmentId
    ? budgets.filter((b) => b.departmentId === formData.departmentId)
    : [];

  const handleSwitchToUpdate = (budget) => {
    setIsUpdateMode(true);
    setSelectedExistingBudget(budget);
    setConflictBudget(null);
    setError("");
    setSuccess("");

    setFormData({
      departmentId: budget.departmentId,
      totalAmount: String(Number(budget.totalAmount) || ""),
      startDate: toInputDate(budget.period?.startDate),
      endDate: toInputDate(budget.period?.endDate),
    });
  };

  const handleSwitchToCreate = () => {
    setIsUpdateMode(false);
    setSelectedExistingBudget(null);
    setConflictBudget(null);
    setError("");

    setFormData((prev) => ({
      ...prev,
      totalAmount: "",
      startDate: "",
      endDate: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setConflictBudget(null);

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

    // If updating, totalAmount cannot be less than usedAmount
    if (isUpdateMode && selectedExistingBudget) {
      const usedAmount = Number(selectedExistingBudget.usedAmount) || 0;
      if (totalAmount < usedAmount) {
        setError(
          `Total amount cannot be less than already disbursed funds (₹${usedAmount.toLocaleString("en-IN")}).`
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      if (isUpdateMode && selectedExistingBudget) {
        const data = await updateBudget(selectedExistingBudget._id, {
          totalAmount,
          period: {
            startDate: formData.startDate,
            endDate: formData.endDate,
          },
        });

        setSuccess(data.message || "Budget allocation updated successfully.");

        // Refresh budgets list
        const refreshed = await getBudgets();
        setBudgets(refreshed.budgets || []);

        setIsUpdateMode(false);
        setSelectedExistingBudget(null);
        setFormData({
          departmentId: "",
          totalAmount: "",
          startDate: "",
          endDate: "",
        });
      } else {
        const data = await createBudget({
          departmentId: formData.departmentId,
          totalAmount,
          period: {
            startDate: formData.startDate,
            endDate: formData.endDate,
          },
        });

        setSuccess(data.message || "Budget created successfully.");

        // Refresh budgets list
        const refreshed = await getBudgets();
        setBudgets(refreshed.budgets || []);

        setFormData({
          departmentId: "",
          totalAmount: "",
          startDate: "",
          endDate: "",
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Operation failed";

      // Check if this was a 409 Conflict because budget already exists for this period
      if (err.response?.status === 409) {
        const matched = departmentBudgets.find((b) => {
          const bStart = toInputDate(b.period?.startDate);
          const bEnd = toInputDate(b.period?.endDate);
          return bStart === formData.startDate && bEnd === formData.endDate;
        });

        if (matched) {
          setConflictBudget(matched);
        } else if (departmentBudgets.length > 0) {
          setConflictBudget(departmentBudgets[0]);
        }
      }

      setError(errMsg);
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
            <h1 className="page-title">
              {isUpdateMode ? "Update Budget Allocation" : "Create Budget"}
            </h1>
            <p className="page-subtitle">
              {isUpdateMode
                ? "Adjust total allocated funds or fiscal boundaries for this department"
                : "Allocate new funds and establish fiscal date boundaries for a department"}
            </p>
          </div>
          {isUpdateMode && (
            <div className="page-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSwitchToCreate}
              >
                Switch to New Budget
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          <span>Loading departments and budget data...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span>{error}</span>
            {conflictBudget && (
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSwitchToUpdate(conflictBudget)}
                  style={{ marginTop: "0.25rem" }}
                >
                  Update Existing Allocation for {formatDateLabel(conflictBudget.period?.startDate)} &ndash; {formatDateLabel(conflictBudget.period?.endDate)}
                </button>
              </div>
            )}
          </div>
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

      {!loading && (
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="departmentId">Department *</label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isUpdateMode}
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

            {/* Department Existing Budgets Banner */}
            {formData.departmentId && departmentBudgets.length > 0 && !isUpdateMode && (
              <div className="existing-budget-banner">
                <div className="existing-budget-banner-header">
                  <span className="existing-budget-banner-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Existing Budgets Found for this Department
                  </span>
                </div>
                <p className="existing-budget-banner-desc">
                  In FlowLedger, duplicate budgets cannot be created for the same fiscal dates.
                  To add or adjust funds for an existing year/period, click <strong>Update Allocation</strong>:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {departmentBudgets.map((b) => (
                    <div key={b._id} className="existing-budget-item">
                      <div className="existing-budget-item-info">
                        <strong>
                          {formatDateLabel(b.period?.startDate)} &ndash; {formatDateLabel(b.period?.endDate)}
                        </strong>
                        <span style={{ color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
                          (Allocated: ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}, Used: ₹{Number(b.usedAmount || 0).toLocaleString("en-IN")})
                        </span>
                        <span
                          className={`badge ${b.status === "ACTIVE" ? "badge-active" : "badge-closed"}`}
                          style={{ marginLeft: "0.5rem", fontSize: "0.7rem" }}
                        >
                          {b.status}
                        </span>
                      </div>
                      {b.status === "ACTIVE" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSwitchToUpdate(b)}
                        >
                          Update Allocation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Mode Details Banner */}
            {isUpdateMode && selectedExistingBudget && (
              <div className="existing-budget-banner" style={{ borderLeft: "4px solid var(--color-teal)" }}>
                <div className="existing-budget-banner-header">
                  <span className="existing-budget-banner-title">
                    Updating Existing Allocation
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSwitchToCreate}
                  >
                    Cancel Update
                  </button>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-slate)" }}>
                  <div>Already disbursed to date: <strong>₹{Number(selectedExistingBudget.usedAmount || 0).toLocaleString("en-IN")}</strong></div>
                  <div>Current total: <strong>₹{Number(selectedExistingBudget.totalAmount || 0).toLocaleString("en-IN")}</strong></div>
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="totalAmount">
                {isUpdateMode ? "New Total Budget Amount (₹) *" : "Total Budget Amount (₹) *"}
              </label>
              <div className="input-with-affix">
                <span className="input-prefix" aria-hidden="true">₹</span>
                <input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  min={isUpdateMode && selectedExistingBudget ? Number(selectedExistingBudget.usedAmount || 0) : 0}
                  step="1"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="500000"
                  required
                />
              </div>
              <p className="form-helper-text">
                {isUpdateMode && selectedExistingBudget
                  ? `Must be at least ₹${Number(selectedExistingBudget.usedAmount || 0).toLocaleString("en-IN")} to cover already disbursed requests.`
                  : "Enter whole rupee amount with no decimals."}
              </p>
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
                    <span>{isUpdateMode ? "Updating Allocation..." : "Creating Budget..."}</span>
                  </>
                ) : (
                  isUpdateMode ? "Update Allocation" : "Create Budget"
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
