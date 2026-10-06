import "./BudgetCard.css";

function BudgetCard({ budget }) {
  const totalAmount = Number(budget.totalAmount) || 0;
  const usedAmount = Number(budget.usedAmount) || 0;
  const availableAmount = Math.max(0, totalAmount - usedAmount);

  const usagePercent = totalAmount > 0 ? Math.min(100, Math.round((usedAmount / totalAmount) * 100)) : 0;

  const getProgressClass = () => {
    if (usagePercent >= 90) return "danger";
    if (usagePercent >= 75) return "warning";
    return "normal";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasPeriod = budget.period?.startDate && budget.period?.endDate;

  return (
    <article className="budget-card">
      <div className="budget-card-header">
        <div className="budget-card-title-group">
          <h3 className="budget-card-title">
            {budget.departmentName || "Department Budget"}
          </h3>
          {hasPeriod && (
            <span className="budget-card-period">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {formatDate(budget.period.startDate)} &ndash; {formatDate(budget.period.endDate)}
              </span>
            </span>
          )}
        </div>

        <span className={`badge ${budget.status === "ACTIVE" ? "badge-active" : "badge-closed"}`}>
          {budget.status || "ACTIVE"}
        </span>
      </div>

      <div className="budget-progress-section">
        <div className="budget-progress-header">
          <span>Utilization</span>
          <span>{usagePercent}% Used</span>
        </div>
        <div className="budget-progress-track" role="progressbar" aria-valuenow={usagePercent} aria-valuemin="0" aria-valuemax="100">
          <div
            className={`budget-progress-fill ${getProgressClass()}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="budget-metrics-grid">
        <div className="budget-metric-item">
          <span className="budget-metric-label">Total Allocated</span>
          <span className="budget-metric-value">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="budget-metric-item">
          <span className="budget-metric-label">Disbursed</span>
          <span className="budget-metric-value used">₹{usedAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="budget-metric-item">
          <span className="budget-metric-label">Remaining</span>
          <span className="budget-metric-value available">₹{availableAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </article>
  );
}

export default BudgetCard;
