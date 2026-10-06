import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canCreateBudget =
    user?.role === "FINANCE_MANAGER" || user?.role === "ORGANIZATION_ADMIN";

  const canViewBudgets =
    user?.role === "DEPARTMENT_MANAGER" ||
    user?.role === "FINANCE_MANAGER" ||
    user?.role === "ORGANIZATION_ADMIN";

  const canCreateRequest = user?.role === "EMPLOYEE";
  const canManageOrganization = user?.role === "ORGANIZATION_ADMIN";

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
        return role || "User";
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-brand-section">
          <NavLink to={isAuthenticated ? "/dashboard" : "/login"} className="navbar-brand" onClick={closeMenu}>
            <span className="navbar-logo-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M7 8h10" />
                <path d="M7 12h5" />
              </svg>
            </span>
            <span className="navbar-title">FlowLedger</span>
          </NavLink>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            className="navbar-mobile-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          </button>
        )}

        <div className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          {!isAuthenticated ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
              onClick={closeMenu}
            >
              Login
            </NavLink>
          ) : (
            <>
              <div className="navbar-nav-group">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>

                {canCreateRequest && (
                  <NavLink
                    to="/requests/new"
                    className={({ isActive }) =>
                      isActive ? "navbar-link active" : "navbar-link"
                    }
                    onClick={closeMenu}
                  >
                    Create Request
                  </NavLink>
                )}

                {canViewBudgets && (
                  <NavLink
                    to="/budgets"
                    className={({ isActive }) =>
                      isActive ? "navbar-link active" : "navbar-link"
                    }
                    onClick={closeMenu}
                  >
                    Budgets
                  </NavLink>
                )}

                {canCreateBudget && (
                  <NavLink
                    to="/budgets/new"
                    className={({ isActive }) =>
                      isActive ? "navbar-link active" : "navbar-link"
                    }
                    onClick={closeMenu}
                  >
                    Create Budget
                  </NavLink>
                )}

                {canManageOrganization && (
                  <>
                    <NavLink
                      to="/departments"
                      className={({ isActive }) =>
                        isActive ? "navbar-link active" : "navbar-link"
                      }
                      onClick={closeMenu}
                    >
                      Departments
                    </NavLink>
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        isActive ? "navbar-link active" : "navbar-link"
                      }
                      onClick={closeMenu}
                    >
                      Users
                    </NavLink>
                  </>
                )}
              </div>

              <div className="navbar-user-section">
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user?.name || "Member"}</span>
                  <span className="navbar-user-role-badge">
                    {formatRoleLabel(user?.role)}
                  </span>
                </div>
                <button
                  type="button"
                  className="navbar-logout-btn"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
