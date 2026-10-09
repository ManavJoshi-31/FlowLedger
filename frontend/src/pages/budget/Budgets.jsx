import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  getBudgets,
  updateBudget,
  closeBudget,
} from "../../services/budgetService";
import { getDepartments } from "../../services/departmentService";
import BudgetCard from "../../components/budget/BudgetCard";
import "./Budgets.css";

function Budgets() {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit budget modal state
  const [editingBudget, setEditingBudget] = useState(null);
  const [editFormData, setEditFormData] = useState({
    totalAmount: "",
    startDate: "",
    endDate: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // Close budget confirmation modal state
  const [closingBudget, setClosingBudget] = useState(null);
  const [closeSubmitting, setCloseSubmitting] = useState(false);
  const [closeError, setCloseError] = useState("");

  const canManageBudgets =
    user?.role === "FINANCE_MANAGER" || user?.role === "ORGANIZATION_ADMIN";

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchBudgetsAndDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const budgetsPromise = getBudgets();
        const departmentsPromise = canManageBudgets
          ? getDepartments().catch(() => ({ departments: [] }))
          : Promise.resolve({ departments: [] });

        const [budgetsData, departmentsData] = await Promise.all([
          budgetsPromise,
          departmentsPromise,
        ]);

        setBudgets(budgetsData.budgets || []);

        if (departmentsData?.departments) {
          const map = {};
          departmentsData.departments.forEach((dept) => {
            map[dept._id] = dept.name;
          });
          setDepartmentsMap(map);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetsAndDepartments();
  }, [canManageBudgets]);

  // Edit handlers
  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setEditError("");
    setEditFormData({
      totalAmount: String(Number(budget.totalAmount) || ""),
      startDate: toInputDate(budget.period?.startDate),
      endDate: toInputDate(budget.period?.endDate),
    });
  };

  const handleCloseEditModal = () => {
    if (editSubmitting) return;
    setEditingBudget(null);
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBudget) return;

    setEditError("");
    const totalAmount = Number(editFormData.totalAmount);
    const usedAmount = Number(editingBudget.usedAmount) || 0;

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      setEditError("Budget amount cannot be negative.");
      return;
    }

    if (!Number.isInteger(totalAmount)) {
      setEditError("Budget amount must be a whole rupee value.");
      return;
    }

    if (totalAmount < usedAmount) {
      setEditError(
        `Total amount cannot be less than already disbursed funds (₹${usedAmount.toLocaleString("en-IN")}).`,
      );
      return;
    }

    if (!editFormData.startDate || !editFormData.endDate) {
      setEditError("Both fiscal start and end dates are required.");
      return;
    }

    if (new Date(editFormData.startDate) >= new Date(editFormData.endDate)) {
      setEditError("Fiscal start date must be strictly before end date.");
      return;
    }

    try {
      setEditSubmitting(true);

      const payload = {
        totalAmount,
        period: {
          startDate: editFormData.startDate,
          endDate: editFormData.endDate,
        },
      };

      const res = await updateBudget(editingBudget._id, payload);

      setBudgets((prev) =>
        prev.map((b) => (b._id === editingBudget._id ? res.budget : b)),
      );

      setActionSuccess(
        res.message || "Budget allocation updated successfully.",
      );
      setTimeout(() => setActionSuccess(""), 4000);
      setEditingBudget(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update budget");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Close handlers
  const handleOpenCloseConfirm = (budget) => {
    setClosingBudget(budget);
    setCloseError("");
  };

  const handleDismissCloseModal = () => {
    if (closeSubmitting) return;
    setClosingBudget(null);
    setCloseError("");
  };

  const handleConfirmCloseBudget = async () => {
    if (!closingBudget) return;

    try {
      setCloseSubmitting(true);
      setCloseError("");

      const res = await closeBudget(closingBudget._id);

      setBudgets((prev) =>
        prev.map((b) => (b._id === closingBudget._id ? res.budget : b)),
      );

      setActionSuccess(res.message || "Budget closed successfully.");
      setTimeout(() => setActionSuccess(""), 4000);
      setClosingBudget(null);
    } catch (err) {
      setCloseError(err.response?.data?.message || "Failed to close budget");
    } finally {
      setCloseSubmitting(false);
    }
  };

  const filteredBudgets = budgets.filter((b) => {
    if (statusFilter === "ACTIVE") return b.status === "ACTIVE";
    if (statusFilter === "CLOSED") return b.status === "CLOSED";
    return true;
  });

  return (
    <div className="budgets-page-layout">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">
            Manage departmental allocations, spend limits, and fiscal boundaries
          </p>
        </div>

        {canManageBudgets && (
          <div className="page-actions">
            <Link to="/budgets/new" className="btn btn-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Budget</span>
            </Link>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="alert alert-success" role="status">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && budgets.length > 0 && (
        <div className="budgets-filter-bar">
          <div className="budgets-filter-group">
            <span className="budgets-filter-label">Filter Status:</span>
            <select
              className="budgets-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Budgets ({budgets.length})</option>
              <option value="ACTIVE">
                Active Only (
                {budgets.filter((b) => b.status === "ACTIVE").length})
              </option>
              <option value="CLOSED">
                Closed ({budgets.filter((b) => b.status === "CLOSED").length})
              </option>
            </select>
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
            Showing {filteredBudgets.length} of {budgets.length} budget records
          </span>
        </div>
      )}

      {loading && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          <span>Loading budgets...</span>
        </div>
      )}

      {!loading && !error && (
        <section aria-label="Departmental Budgets">
          {filteredBudgets.length === 0 ? (
            <div className="state-box">
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-steel)" }}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="state-box-title">
                {statusFilter === "ALL"
                  ? "No budgets established"
                  : `No ${statusFilter.toLowerCase()} budgets`}
              </span>
              <span className="state-box-desc">
                {statusFilter === "ALL" && canManageBudgets
                  ? "Click 'Create Budget' above to allocate a new departmental budget."
                  : "Try clearing or changing your filters to see other budgets."}
              </span>
            </div>
          ) : (
            <div className="budgets-cards-grid">
              {filteredBudgets.map((budget) => {
                const deptName =
                  departmentsMap[budget.departmentId] ||
                  budget.departmentName ||
                  "Department Budget";

                return (
                  <BudgetCard
                    key={budget._id}
                    budget={budget}
                    departmentName={deptName}
                    canManage={canManageBudgets}
                    onEdit={handleOpenEdit}
                    onClose={handleOpenCloseConfirm}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-budget-title"
        >
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 id="edit-budget-title" className="modal-title">
                Edit Budget Allocation
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="budget-info-summary">
                  <div className="budget-info-row">
                    <span>Department</span>
                    <span>
                      {departmentsMap[editingBudget.departmentId] ||
                        editingBudget.departmentName ||
                        "Department"}
                    </span>
                  </div>
                  <div className="budget-info-row">
                    <span>Disbursed so far</span>
                    <span style={{ color: "var(--color-slate)" }}>
                      ₹
                      {Number(editingBudget.usedAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="budget-info-row">
                    <span>Current Allocation</span>
                    <span>
                      ₹
                      {Number(editingBudget.totalAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>

                {editError && (
                  <div
                    className="alert alert-error"
                    role="alert"
                    style={{ marginBottom: "1rem" }}
                  >
                    <span>{editError}</span>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="edit-totalAmount">
                    New Total Budget Amount (₹) *
                  </label>
                  <div className="input-with-affix">
                    <span className="input-prefix" aria-hidden="true">
                      ₹
                    </span>
                    <input
                      id="edit-totalAmount"
                      name="totalAmount"
                      type="number"
                      min={Number(editingBudget.usedAmount) || 0}
                      step="1"
                      value={editFormData.totalAmount}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <p className="form-helper-text">
                    Must be at least ₹
                    {Number(editingBudget.usedAmount || 0).toLocaleString(
                      "en-IN",
                    )}{" "}
                    to cover already disbursed funds.
                  </p>
                </div>

                <div
                  className="form-grid-2col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-field">
                    <label htmlFor="edit-startDate">Fiscal Start Date *</label>
                    <input
                      id="edit-startDate"
                      name="startDate"
                      type="date"
                      value={editFormData.startDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="edit-endDate">Fiscal End Date *</label>
                    <input
                      id="edit-endDate"
                      name="endDate"
                      type="date"
                      value={editFormData.endDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseEditModal}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? "Updating..." : "Update Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Budget Confirmation Modal */}
      {closingBudget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-budget-title"
        >
          <div className="modal-dialog">
            <div className="modal-header">
              <h2
                id="close-budget-title"
                className="modal-title"
                style={{ color: "var(--color-danger-text)" }}
              >
                Close Department Budget
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleDismissCloseModal}
                disabled={closeSubmitting}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: "var(--color-slate)", marginBottom: "1rem" }}>
                Are you sure you want to close the budget for{" "}
                <strong>
                  {departmentsMap[closingBudget.departmentId] ||
                    closingBudget.departmentName ||
                    "this department"}
                </strong>
                ?
              </p>

              <div
                className="budget-info-summary"
                style={{ borderLeft: "3px solid var(--color-danger-text)" }}
              >
                <div className="budget-info-row">
                  <span>Total Allocated:</span>
                  <span>
                    ₹
                    {Number(closingBudget.totalAmount || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="budget-info-row">
                  <span>Disbursed to Date:</span>
                  <span>
                    ₹
                    {Number(closingBudget.usedAmount || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="budget-info-row">
                  <span>Remaining Unspent:</span>
                  <span style={{ color: "var(--color-teal)" }}>
                    ₹
                    {(
                      Number(closingBudget.totalAmount || 0) -
                      Number(closingBudget.usedAmount || 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div
                className="alert alert-error"
                style={{ marginBottom: 0, fontSize: "0.85rem" }}
              >
                <span>
                  <strong>Important:</strong> Once closed, this budget becomes
                  read-only. Employees will not be able to submit requests
                  against it, and no pending requests can be approved. This
                  action cannot be reversed.
                </span>
              </div>

              {closeError && (
                <div
                  className="alert alert-error"
                  style={{ marginTop: "1rem" }}
                >
                  <span>{closeError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDismissCloseModal}
                disabled={closeSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmCloseBudget}
                disabled={closeSubmitting}
              >
                {closeSubmitting ? "Closing..." : "Confirm & Close Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
