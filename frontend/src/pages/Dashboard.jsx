import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import DashboardCard from "../components/DashboardCard";
import {
  getDashboardNotifications,
  markNotificationAsRead,
} from "../services/dashboardService";
import NotificationItem from "../components/NotificationItem";
import BudgetCard from "../components/BudgetCard";
import { getBudgets } from "../services/budgetService";
import { getDepartments } from "../services/departmentService";
import { getFinancialRequests } from "../services/financialRequestService";
import FinancialRequestList from "../components/FinancialRequestList";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useContext(AuthContext);

  const isFinanceManager = user?.role === "FINANCE_MANAGER";

  const canViewBudgets =
    user?.role === "DEPARTMENT_MANAGER" ||
    user?.role === "FINANCE_MANAGER" ||
    user?.role === "ORGANIZATION_ADMIN";

  const canViewRequests =
    user?.role === "EMPLOYEE" ||
    user?.role === "DEPARTMENT_MANAGER" ||
    user?.role === "ORGANIZATION_ADMIN";

  // → actual data returned by backend
  const [notifications, setNotifications] = useState([]);

  // → whether the notification request is currently running
  const [loading, setLoading] = useState(true);

  // → error message we want to show to the user
  const [error, setError] = useState("");

  const [budgets, setBudgets] = useState([]);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetsError, setBudgetsError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(canViewRequests);
  const [requestsError, setRequestsError] = useState("");

  const handleRequestUpdated = (updatedRequest) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request._id === updatedRequest._id ? updatedRequest : request,
      ),
    );

    if (canViewBudgets) {
      getBudgets()
        .then((data) => setBudgets(data.budgets))
        .catch((err) => console.error("Failed to refresh budgets:", err));
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data?.message,
      );
    }
  };

  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const approvedRequests = requests.filter(
    (request) => request.status === "APPROVED",
  ).length;

  const totalAllocated = budgets.reduce(
    (total, budget) => total + Number(budget.totalAmount || 0),
    0,
  );

  const totalUsed = budgets.reduce(
    (total, budget) => total + Number(budget.usedAmount || 0),
    0,
  );

  const availableBudget = budgets.reduce(
    (total, budget) =>
      total + (Number(budget.totalAmount || 0) - Number(budget.usedAmount || 0)),
    0,
  );

  const activeBudgetsCount = budgets.filter(
    (budget) => budget.status === "ACTIVE",
  ).length;

  let cards = [];

  if (isFinanceManager) {
    cards = [
      {
        title: "Total Allocated Budget",
        value: `₹${totalAllocated.toLocaleString("en-IN")}`,
      },
      {
        title: "Total Utilized",
        value: `₹${totalUsed.toLocaleString("en-IN")}`,
      },
      {
        title: "Available Balance",
        value: `₹${availableBudget.toLocaleString("en-IN")}`,
      },
      {
        title: "Active Budgets",
        value: `${activeBudgetsCount} / ${budgets.length}`,
      },
    ];
  } else {
    if (canViewRequests) {
      cards.push(
        {
          title: "Pending Requests",
          value: pendingRequests,
        },
        {
          title: "Approved Requests",
          value: approvedRequests,
        },
      );
    }

    if (canViewBudgets) {
      cards.push({
        title: "Available Budget",
        value: `₹${availableBudget.toLocaleString("en-IN")}`,
      });
    }
  }

  useEffect(() => {
    if (!canViewBudgets) {
      return;
    }

    const fetchBudgets = async () => {
      try {
        setBudgetsLoading(true);
        setBudgetsError("");

        const budgetsPromise = getBudgets();
        const canFetchDepts =
          user?.role === "FINANCE_MANAGER" ||
          user?.role === "ORGANIZATION_ADMIN";

        const deptsPromise = canFetchDepts
          ? getDepartments().catch(() => ({ departments: [] }))
          : Promise.resolve({ departments: [] });

        const [budgetsData, deptsData] = await Promise.all([
          budgetsPromise,
          deptsPromise,
        ]);

        setBudgets(budgetsData.budgets || []);

        if (deptsData?.departments) {
          const map = {};
          deptsData.departments.forEach((d) => {
            map[d._id] = d.name;
          });
          setDepartmentsMap(map);
        }
      } catch (error) {
        setBudgetsError(
          error.response?.data?.message || "Failed to load budgets",
        );
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchBudgets();
  }, [canViewBudgets, user?.role]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardNotifications();

        setNotifications(data.notifications);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load notifications",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!canViewRequests) {
      return;
    }

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        setRequestsError("");

        const data = await getFinancialRequests();

        setRequests(data.requests);
      } catch (error) {
        setRequestsError(
          error.response?.data?.message || "Failed to load financial requests",
        );
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, [canViewRequests]);

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatRole = (role) => {
    switch (role) {
      case "ORGANIZATION_ADMIN":
        return "Organization Administrator";
      case "FINANCE_MANAGER":
        return "Finance Manager";
      case "DEPARTMENT_MANAGER":
        return "Department Manager";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role || "Member";
    }
  };

  const isKpiLoading = isFinanceManager ? budgetsLoading : requestsLoading;
  const kpiError = isFinanceManager ? budgetsError : requestsError;

  return (
    <div className="dashboard-layout">
      {/* Hero Welcome Banner */}
      <header className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1 className="dashboard-greeting">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="dashboard-subtext">
            {formatRole(user?.role)} &bull;{" "}
            {isFinanceManager
              ? "Department budget allocation & financial governance"
              : "Overview of financial activity & allocations"}
          </p>
        </div>

        <div className="dashboard-hero-meta">
          <span className="dashboard-date-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{todayFormatted}</span>
          </span>
        </div>
      </header>

      {/* KPI Cards Section */}
      {isKpiLoading && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          <span>Loading overview statistics...</span>
        </div>
      )}

      {kpiError && (
        <div className="alert alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{kpiError}</span>
        </div>
      )}

      {!isKpiLoading && !kpiError && (
        <section aria-label="Key Performance Indicators">
          <div className="dashboard-metrics-grid">
            {cards.map((card) => (
              <DashboardCard
                key={card.title}
                title={card.title}
                value={card.value}
              />
            ))}
          </div>
        </section>
      )}

      {/* Split Layout: Main Content vs Notifications */}
      <div className="dashboard-content-split">
        {/* Left Column for Finance Manager: Department Budgets */}
        {isFinanceManager ? (
          <section className="dashboard-section" aria-labelledby="budgets-heading">
            <div className="dashboard-section-header">
              <h2 id="budgets-heading" className="dashboard-section-title">
                <span>Department Budgets</span>
                {!budgetsLoading && (
                  <span className="dashboard-section-count">{budgets.length}</span>
                )}
              </h2>
              <div className="dashboard-section-actions">
                <Link to="/budgets/new" className="btn btn-primary btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create Budget</span>
                </Link>
              </div>
            </div>

            {budgetsLoading && (
              <div className="loading-indicator">
                <span className="spinner"></span>
                <span>Loading budgets...</span>
              </div>
            )}

            {budgetsError && (
              <div className="alert alert-error" role="alert">
                <span>{budgetsError}</span>
              </div>
            )}

            {!budgetsLoading && !budgetsError && (
              <div className="budgets-grid" style={{ marginTop: "1rem" }}>
                {budgets.length === 0 ? (
                  <div className="state-box">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-steel)" }}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span className="state-box-title">No budgets found</span>
                    <span className="state-box-desc">
                      Get started by allocating departmental budgets.
                    </span>
                  </div>
                ) : (
                  budgets.map((budget) => (
                    <BudgetCard
                      key={budget._id}
                      budget={budget}
                      departmentName={
                        departmentsMap[budget.departmentId] ||
                        budget.departmentName ||
                        "Department Budget"
                      }
                    />
                  ))
                )}
              </div>
            )}
          </section>
        ) : (
          /* Left Column for Roles Authorized to View Financial Requests */
          <section className="dashboard-section" aria-labelledby="requests-heading">
            {canViewRequests && (
              <>
                <div className="dashboard-section-header">
                  <h2 id="requests-heading" className="dashboard-section-title">
                    <span>Financial Requests</span>
                    {!requestsLoading && (
                      <span className="dashboard-section-count">{requests.length}</span>
                    )}
                  </h2>
                </div>

                {requestsLoading && (
                  <div className="loading-indicator">
                    <span className="spinner"></span>
                    <span>Loading financial requests...</span>
                  </div>
                )}

                {requestsError && (
                  <div className="alert alert-error" role="alert">
                    <span>{requestsError}</span>
                  </div>
                )}

                {!requestsLoading && !requestsError && (
                  <FinancialRequestList
                    requests={requests}
                    onRequestUpdated={handleRequestUpdated}
                  />
                )}
              </>
            )}

            {/* Budgets Section for Authorized Roles (Department Manager & Org Admin) */}
            {canViewBudgets && (
              <div style={{ marginTop: canViewRequests ? "1.5rem" : "0" }}>
                <div className="dashboard-section-header">
                  <h2 className="dashboard-section-title">
                    <span>Department Budgets</span>
                    {!budgetsLoading && (
                      <span className="dashboard-section-count">{budgets.length}</span>
                    )}
                  </h2>
                </div>

                {budgetsLoading && (
                  <div className="loading-indicator">
                    <span className="spinner"></span>
                    <span>Loading budgets...</span>
                  </div>
                )}

                {budgetsError && (
                  <div className="alert alert-error" role="alert">
                    <span>{budgetsError}</span>
                  </div>
                )}

                {!budgetsLoading && !budgetsError && (
                  <div className="budgets-grid" style={{ marginTop: "1rem" }}>
                    {budgets.length === 0 ? (
                      <div className="state-box">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-steel)" }}>
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span className="state-box-title">No budgets found</span>
                        <span className="state-box-desc">
                          No active budgets have been allocated for your role or department yet.
                        </span>
                      </div>
                    ) : (
                      budgets.map((budget) => (
                        <BudgetCard
                          key={budget._id}
                          budget={budget}
                          departmentName={
                            departmentsMap[budget.departmentId] ||
                            budget.departmentName ||
                            (user?.role === "DEPARTMENT_MANAGER"
                              ? "Your Department Budget"
                              : "Department Budget")
                          }
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Right Column: Notifications Panel */}
        <aside className="dashboard-section" aria-labelledby="notifications-heading">
          <div className="dashboard-section-header">
            <h2 id="notifications-heading" className="dashboard-section-title">
              <span>Notifications</span>
              {!loading && (
                <span className="dashboard-section-count">
                  {notifications.filter((n) => !n.isRead).length} new
                </span>
              )}
            </h2>
          </div>

          <div className="notifications-panel">
            {loading && (
              <div className="loading-indicator">
                <span className="spinner"></span>
                <span>Loading notifications...</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="notifications-scroll-list">
                {notifications.length === 0 ? (
                  <div className="state-box" style={{ padding: "2rem 1rem" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-steel)" }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="state-box-title" style={{ fontSize: "1rem" }}>All caught up</span>
                    <span className="state-box-desc" style={{ fontSize: "0.85rem" }}>
                      You have no unread notifications at this time.
                    </span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkNotificationAsRead}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
