import { NavLink } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const canCreateBudget =
    user?.role === "FINANCE_MANAGER" || user?.role === "ORGANIZATION_ADMIN";

  const canViewBudgets =
    user?.role === "DEPARTMENT_MANAGER" ||
    user?.role === "FINANCE_MANAGER" ||
    user?.role === "ORGANIZATION_ADMIN";

  const canCreateRequest = user?.role === "EMPLOYEE";

  return (
    <nav className="navbar">
      <h1 className="navbar-brand">FlowLedger</h1>

      <div className="navbar-links">
        {!isAuthenticated && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Login
          </NavLink>
        )}

        {isAuthenticated && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Dashboard
            </NavLink>

            {canCreateRequest && (
              <NavLink
                to="/requests/new"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
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
              >
                Create Budget
              </NavLink>
            )}
            <button type="button" className="navbar-link" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
