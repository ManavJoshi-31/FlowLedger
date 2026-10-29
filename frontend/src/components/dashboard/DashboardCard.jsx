import "./DashboardCard.css";

function DashboardCard({
  title,
  value,
  subtitle,
  badge,
  badgeType = "default",
  progress,
  progressLabel,
  icon,
  theme,
}) {
  const getCardTheme = () => {
    if (theme) return `card-theme-${theme}`;
    const lower = (title || "").toLowerCase();
    if (lower.includes("pending")) return "card-theme-pending";
    if (lower.includes("approved")) return "card-theme-approved";
    if (lower.includes("budget") || lower.includes("allocated") || lower.includes("utilized")) return "card-theme-budget";
    return "card-theme-default";
  };

  const renderIcon = () => {
    if (icon) return icon;
    const lower = (title || "").toLowerCase();
    if (lower.includes("pending")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    if (lower.includes("approved")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    }
    if (lower.includes("utilized")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    }
    if (lower.includes("budget") || lower.includes("allocated")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  };

  const badgeText =
    typeof badge === "object" && badge !== null ? badge.text : badge;

  const badgeVariant =
    typeof badge === "object" && badge !== null
      ? badge.variant || badgeType
      : badgeType;

  const getBadgeClass = (variant = badgeVariant) => {
    switch (variant) {
      case "optimal":
      case "success":
      case "approved":
        return "kpi-badge-success";
      case "warning":
      case "pending":
        return "kpi-badge-warning";
      case "danger":
      case "rejected":
        return "kpi-badge-danger";
      case "info":
      case "teal":
        return "kpi-badge-info";
      case "neutral":
      default:
        return "kpi-badge-default";
    }
  };

  return (
    <article className={`dashboard-card ${getCardTheme()}`}>
      <div className="dashboard-card-top">
        <span className="dashboard-card-title">{title}</span>
        {badgeText ? (
          <span className={`kpi-badge ${getBadgeClass(badgeVariant)}`}>
            {badgeText}
          </span>
        ) : (
          <div className="dashboard-card-icon-wrapper">{renderIcon()}</div>
        )}
      </div>

      <div className="dashboard-card-value-container">
        <span className="dashboard-card-value tabular-nums">{value}</span>
      </div>

      {progress !== undefined && (
        <div className="dashboard-card-progress-box">
          <div
            className="dashboard-card-progress-track"
            role="progressbar"
            aria-valuenow={Math.min(100, Math.max(0, progress))}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="dashboard-card-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {progressLabel && (
            <span className="dashboard-card-progress-label">{progressLabel}</span>
          )}
        </div>
      )}

      {subtitle && (
        <div className="dashboard-card-footer">
          <span className="dashboard-card-subtitle">{subtitle}</span>
          {badgeText && <div className="dashboard-card-mini-icon">{renderIcon()}</div>}
        </div>
      )}
    </article>
  );
}

export default DashboardCard;
