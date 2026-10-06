import "./DashboardCard.css";

function DashboardCard({ title, value }) {
  const getCardTheme = () => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("pending")) return "card-theme-pending";
    if (lower.includes("approved")) return "card-theme-approved";
    if (lower.includes("budget")) return "card-theme-budget";
    return "card-theme-default";
  };

  const renderIcon = () => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("pending")) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    if (lower.includes("approved")) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    }
    if (lower.includes("budget")) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  };

  return (
    <article className={`dashboard-card ${getCardTheme()}`}>
      <div className="dashboard-card-content">
        <h2 className="dashboard-card-title">{title}</h2>
        <p className="dashboard-card-value">{value}</p>
      </div>
      <div className="dashboard-card-icon-wrapper">
        {renderIcon()}
      </div>
    </article>
  );
}

export default DashboardCard;
