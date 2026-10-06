import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { getBudgets } from "../services/budgetService";
import BudgetCard from "../components/BudgetCard";
import "./Budgets.css";

function Budgets() {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreateBudget =
    user?.role === "FINANCE_MANAGER" || user?.role === "ORGANIZATION_ADMIN";

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBudgets();

        setBudgets(data.budgets);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  return (
    <div className="budgets-page-layout">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">
            Manage departmental allocations, spend limits, and governance
          </p>
        </div>

        {canCreateBudget && (
          <div className="page-actions">
            <Link to="/budgets/new" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Budget</span>
            </Link>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          <span>Loading budgets...</span>
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

      {!loading && !error && (
        <section aria-label="Departmental Budgets">
          {budgets.length === 0 ? (
            <div className="state-box">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-steel)" }}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="state-box-title">No budgets established</span>
              <span className="state-box-desc">
                There are no active budgets found. {canCreateBudget && "Click 'Create Budget' above to allocate a new departmental budget."}
              </span>
            </div>
          ) : (
            <div className="budgets-cards-grid">
              {budgets.map((budget) => (
                <BudgetCard key={budget._id} budget={budget} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Budgets;
