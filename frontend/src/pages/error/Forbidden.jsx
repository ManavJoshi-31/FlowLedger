import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import "./Forbidden.css";

const ROLE_METADATA = {
  ORGANIZATION_ADMIN: {
    label: "Organization Administrator",
    desc: "Tenant authority with department provisioning, user governance, and organization oversight.",
    badgeClass: "badge-role-admin",
  },
  FINANCE_MANAGER: {
    label: "Finance Manager",
    desc: "Institutional financial controller managing budget envelopes and fiscal allocations.",
    badgeClass: "badge-role-finance",
  },
  DEPARTMENT_MANAGER: {
    label: "Department Manager",
    desc: "Operational supervisor reviewing and approving departmental financial requests and budgets.",
    badgeClass: "badge-role-dept",
  },
  EMPLOYEE: {
    label: "Department Employee",
    desc: "Operational staff submitting expense and procurement requests against department envelopes.",
    badgeClass: "badge-role-emp",
  },
};

export default function Forbidden({ currentRole: propRole, requiredRoles: propRequiredRoles, customMessage }) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();

  const activeRole = propRole || user?.role || location.state?.currentRole;
  const required = propRequiredRoles || location.state?.requiredRoles || [];
  const message = customMessage || location.state?.customMessage;

  const activeRoleMeta = ROLE_METADATA[activeRole] || {
    label: activeRole || "Unassigned Session",
    desc: "Standard authenticated entity.",
    badgeClass: "badge-role-default",
  };

  const getGovernanceNotice = () => {
    if (message) return message;

    if (required.length === 1 && required.includes("ORGANIZATION_ADMIN")) {
      return "Department structuring, manager assignment, and tenant-level configurations require Organization Administrator governance privileges.";
    }

    if (required.includes("FINANCE_MANAGER") && required.includes("ORGANIZATION_ADMIN") && required.length === 2) {
      return "Budget envelope creation and capital allocation are restricted to Finance Managers and Organization Administrators under the platform's separation of duties policy.";
    }

    if (required.includes("DEPARTMENT_MANAGER") && required.includes("ORGANIZATION_ADMIN") && required.length === 2) {
      return "User provisioning, employee role delegation, and cryptographic audit log inspection are restricted to Department Managers and Organization Administrators.";
    }

    if (required.length === 1 && required.includes("EMPLOYEE")) {
      return "Operational expense request submission is strictly reserved for Department Employees. Department Managers and Finance Controllers govern budgets and review submissions rather than creating personal requests.";
    }

    if (required.length > 0) {
      return `Access to this governance resource is restricted to authorized roles (${required
        .map((r) => ROLE_METADATA[r]?.label || r)
        .join(", ")}).`;
    }

    return "Your authenticated credentials do not possess the required security clearances to inspect or modify this governance resource.";
  };

  return (
    <div className="forbidden-page-root">
      <div className="forbidden-page-ambient" aria-hidden="true">
        <div className="forbidden-sphere sphere-slate" />
        <div className="forbidden-sphere sphere-ink" />
      </div>

      <div className="forbidden-card">
        <div className="forbidden-badge">
          <span className="forbidden-pulse-dot" />
          STATUS 403 &bull; INSUFFICIENT GOVERNANCE PRIVILEGES
        </div>

        <div className="forbidden-shield-wrap" aria-hidden="true">
          <svg
            className="forbidden-shield-svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>

        <div className="forbidden-code">403</div>
        <h1 className="forbidden-title">Access Restricted</h1>

        <p className="forbidden-description">{getGovernanceNotice()}</p>

        {/* Role Boundary Comparison Card */}
        <div className="forbidden-role-box">
          <div className="role-box-row">
            <span className="role-box-label">Your Active Role:</span>
            <span className={`role-chip active-chip ${activeRoleMeta.badgeClass}`}>
              {activeRoleMeta.label}
            </span>
          </div>

          {required.length > 0 && (
            <div className="role-box-row required-row">
              <span className="role-box-label">Authorized Role(s):</span>
              <div className="role-chips-group">
                {required.map((roleKey) => (
                  <span key={roleKey} className="role-chip required-chip">
                    {ROLE_METADATA[roleKey]?.label || roleKey}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="forbidden-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-error-primary">
              Return to Safe Dashboard &rarr;
            </Link>
          ) : (
            <Link to="/" className="btn-error-primary">
              Return to Overview &rarr;
            </Link>
          )}

          <Link
            to="/login"
            onClick={() => {
              if (logout) logout();
            }}
            className="btn-error-secondary"
          >
            Switch User Account
          </Link>
        </div>

        <div className="forbidden-footer">
          <span>FlowLedger Multi-Tenant Defense-in-Depth Authorization &bull; Role-Based Governance</span>
        </div>
      </div>
    </div>
  );
}

