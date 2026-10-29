import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import NotificationContext from "../../context/NotificationContext";
import "./TopNav.css";

function TopNav({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, toggleDrawer } = useContext(NotificationContext);
  const location = useLocation();

  const formatRoleLabel = (role) => {
    switch (role) {
      case "ORGANIZATION_ADMIN":
        return "Org Admin";
      case "FINANCE_MANAGER":
        return "Finance Manager";
      case "DEPARTMENT_MANAGER":
        return "Dept Manager";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role || "Member";
    }
  };

  const getPageTitle = (pathname) => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/requests/new")) return "Create Request";
    if (pathname.includes("/budgets/new")) return "Allocate Budget";
    if (pathname.includes("/budgets")) return "Budgets";
    if (pathname.includes("/departments")) return "Departments";
    if (pathname.includes("/users")) return "Users";
    if (pathname.includes("/audit-logs")) return "Audit Logs";
    return "Overview";
  };

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getInitials = (name) => {
    if (!name) return "FL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const tenantName = user?.organizationName || "Enterprise Fiscal Unit";

  return (
    <header className="app-topnav" aria-label="Top Utility Header">
      <div className="topnav-container">
        {/* Left Section: Mobile Toggle & Breadcrumbs */}
        <div className="topnav-left">
          <button
            type="button"
            className="topnav-hamburger"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="topnav-breadcrumbs">
            <span className="breadcrumb-root">FlowLedger</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{getPageTitle(location.pathname)}</span>
            <span className="breadcrumb-bullet">&bull;</span>
            <span className="topnav-tenant-pill" title={tenantName}>
              <span className="tenant-dot" aria-hidden="true"></span>
              <span>{tenantName}</span>
            </span>
          </div>
        </div>

        {/* Right Section: Date, Profile, Logout */}
        <div className="topnav-right">
          <div className="topnav-date-strip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{todayFormatted}</span>
          </div>

          <div className="topnav-divider" aria-hidden="true" />

          {/* Notification Center Trigger */}
          <button
            type="button"
            className="topnav-bell-btn"
            onClick={toggleDrawer}
            aria-label={`Open notifications (${unreadCount} unread)`}
            title="Open Notifications & Activity Center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="topnav-bell-badge">{unreadCount}</span>
            )}
          </button>

          {/* User Profile Summary */}
          <div className="topnav-profile-card">
            <div className="topnav-avatar" aria-hidden="true">
              {getInitials(user?.name)}
            </div>
            <div className="topnav-user-details">
              <span className="topnav-user-name">{user?.name || "Member"}</span>
              <span className="topnav-user-role">{formatRoleLabel(user?.role)}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className="topnav-logout-btn"
            onClick={logout}
            title="Sign out of FlowLedger"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
