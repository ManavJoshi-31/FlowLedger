import "./BudgetCard.css";

function BudgetCard({
  budget,
  departmentName,
  canManage = false,
  onEdit,
  onClose,
}) {
  const totalAmount = Number(budget.totalAmount) || 0;
  const usedAmount = Number(budget.usedAmount) || 0;
  const availableAmount = Math.max(0, totalAmount - usedAmount);

  const usagePercent =
    totalAmount > 0
      ? Math.min(100, Math.round((usedAmount / totalAmount) * 100))
      : 0;

  const getPacingStatus = () => {
    if (usagePercent >= 90) {
      return { label: "Cap Warning", className: "pacing-danger" };
    }
    if (usagePercent >= 75) {
      return { label: "Pacing High", className: "pacing-warning" };
    }
    if (usagePercent > 0) {
      return { label: "On Track", className: "pacing-optimal" };
    }
    return { label: "Allocated", className: "pacing-neutral" };
  };

  const getProgressFillClass = () => {
    if (usagePercent >= 90) return "fill-danger";
    if (usagePercent >= 75) return "fill-warning";
    return "fill-optimal";
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
  const isClosed = budget.status === "CLOSED";
  const displayName = departmentName || budget.departmentName || "Department Budget";
  const pacing = getPacingStatus();

  return (
    <article className={`budget-card ${isClosed ? "budget-card-closed" : ""}`}>
      {/* Header Row: Title & Pacing / Status */}
      <div className="budget-card-header">
        <div className="budget-card-title-group">
          <h3 className="budget-card-title">{displayName}</h3>
          {hasPeriod && (
            <span className="budget-card-period">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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

        <div className="budget-card-status-badges">
          {!isClosed ? (
            <span className={`pacing-badge ${pacing.className}`}>
              {pacing.label}
            </span>
          ) : (
            <span className="badge badge-closed">Closed</span>
          )}
        </div>
      </div>

      {/* Main Figures: Disbursed vs Cap */}
      <div className="budget-figures-row">
        <div className="budget-figure-main">
          <span className="budget-figure-spent tabular-nums">
            ₹{usedAmount.toLocaleString("en-IN")}
          </span>
          <span className="budget-figure-cap tabular-nums">
            / ₹{totalAmount.toLocaleString("en-IN")} cap
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="budget-progress-section">
        <div
          className="budget-progress-track"
          role="progressbar"
          aria-valuenow={usagePercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className={`budget-progress-fill ${getProgressFillClass()}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Row: % Utilized & Buffer Remaining */}
      <div className="budget-summary-strip">
        <span className="budget-summary-item">
          <strong>{usagePercent}%</strong> Utilized
        </span>
        <span className="budget-summary-item tabular-nums buffer">
          ₹{availableAmount.toLocaleString("en-IN")} Buffer
        </span>
      </div>

      {/* Actions (if management is enabled) */}
      {canManage && (
        <div className="budget-card-actions">
          {!isClosed ? (
            <>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(budget)}
                  title="Adjust total funds or dates"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onClose(budget)}
                  title="Close budget period"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Close</span>
                </button>
              )}
            </>
          ) : (
            <span className="budget-card-closed-note">
              Archived / Read-only
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export default BudgetCard;
