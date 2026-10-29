import { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "./AppSidebar.css";

function AppSidebar({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);

  const isOrgAdmin = user?.role === "ORGANIZATION_ADMIN";
  const isFinanceManager = user?.role === "FINANCE_MANAGER";
  const isDeptManager = user?.role === "DEPARTMENT_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  const canCreateRequest = isEmployee;
  const canViewBudgets = isDeptManager || isFinanceManager || isOrgAdmin;
  const canManageDepartments = isOrgAdmin;
  const canManageUsers = isOrgAdmin || isDeptManager;
  const canViewAuditHistory = isOrgAdmin || isDeptManager;

  const tenantName = user?.organizationName || "FlowLedger Enterprise";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "sidebar-open" : ""}`} aria-label="Main Sidebar Navigation">
        <div className="sidebar-container">
          {/* Brand Header */}
          <div className="sidebar-brand-wrapper">
            <div className="sidebar-brand-logo" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M7 8h10" />
                <path d="M7 12h5" />
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title font-serif">FlowLedger</span>
              <span className="sidebar-brand-tenant" title={tenantName}>{tenantName}</span>
            </div>
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close navigation sidebar"
            >
              &times;
            </button>
          </div>

          {/* Quick CTA Action */}
          <div className="sidebar-cta-section">
            {canCreateRequest ? (
              <NavLink
                to="/requests/new"
                className="btn btn-primary sidebar-cta-btn"
                onClick={onClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Request</span>
              </NavLink>
            ) : isFinanceManager || isOrgAdmin ? (
              <NavLink
                to="/budgets/new"
                className="btn btn-primary sidebar-cta-btn"
                onClick={onClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Allocate Budget</span>
              </NavLink>
            ) : null}
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav" aria-label="Main Links">
            <span className="sidebar-nav-section-label">Fiscal Governance</span>

            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard</span>
            </NavLink>

            {canCreateRequest && (
              <NavLink
                to="/requests/new"
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <span>Create Request</span>
              </NavLink>
            )}

            {canViewBudgets && (
              <NavLink
                to="/budgets"
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Budgets</span>
              </NavLink>
            )}

            <span className="sidebar-nav-section-label" style={{ marginTop: "1rem" }}>Administration</span>

            {canManageDepartments && (
              <NavLink
                to="/departments"
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
                <span>Departments</span>
              </NavLink>
            )}

            {canManageUsers && (
              <NavLink
                to="/users"
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Users</span>
              </NavLink>
            )}

            {canViewAuditHistory && (
              <NavLink
                to="/audit-logs"
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Audit History</span>
              </NavLink>
            )}
          </nav>

          {/* Version Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-version-tag">
              FlowLedger Enterprise &bull; v2.4
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
