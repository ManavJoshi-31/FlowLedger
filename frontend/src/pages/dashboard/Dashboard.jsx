import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import NotificationContext from "../../context/NotificationContext";
import DashboardCard from "../../components/dashboard/DashboardCard";
import NotificationItem from "../../components/notification/NotificationItem";
import BudgetCard from "../../components/budget/BudgetCard";
import { getBudgets } from "../../services/budgetService";
import { getDepartments } from "../../services/departmentService";
import { getFinancialRequests } from "../../services/financialRequestService";
import FinancialRequestList from "../../components/financialRequest/FinancialRequestList";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const {
    notifications,
    unreadCount: unreadNotificationsCount,
    loading: notifsLoading,
    error: notifsError,
    markAsRead: handleMarkNotificationAsRead,
    markAllAsRead: handleMarkAllAsRead,
    openDrawer: openNotificationDrawer,
  } = useContext(NotificationContext);

  const isFinanceManager = user?.role === "FINANCE_MANAGER";
  const isOrgAdmin = user?.role === "ORGANIZATION_ADMIN";
  const isDeptManager = user?.role === "DEPARTMENT_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  const canViewBudgets = isDeptManager || isFinanceManager || isOrgAdmin;
  const canViewRequests = isEmployee || isDeptManager || isOrgAdmin;
  const canCreateBudget = isFinanceManager || isOrgAdmin;
  const canCreateRequest = isEmployee;
  const canManageUsers = isOrgAdmin || isDeptManager;
  const canManageDepartments = isOrgAdmin;
  const canViewAuditHistory = isOrgAdmin || isDeptManager;

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
        .then((data) => setBudgets(data.budgets || []))
        .catch((err) => console.error("Failed to refresh budgets:", err));
    }
  };

  // Metric Computations
  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const pendingAmount = requests
    .filter((request) => request.status === "PENDING")
    .reduce((sum, request) => sum + Number(request.amount || 0), 0);

  const approvedRequests = requests.filter(
    (request) => request.status === "APPROVED",
  ).length;

  const approvedAmount = requests
    .filter((request) => request.status === "APPROVED")
    .reduce((sum, request) => sum + Number(request.amount || 0), 0);

  const rejectedRequests = requests.filter(
    (request) => request.status === "REJECTED",
  ).length;

  const totalAllocated = budgets.reduce(
    (total, budget) => total + Number(budget.totalAmount || 0),
    0,
  );

  const totalUsed = budgets.reduce(
    (total, budget) => total + Number(budget.usedAmount || 0),
    0,
  );

  const availableBudget = Math.max(0, totalAllocated - totalUsed);

  const utilizationRate =
    totalAllocated > 0
      ? Math.min(100, Math.round((totalUsed / totalAllocated) * 100))
      : 0;

  const activeBudgetsCount = budgets.filter(
    (budget) => budget.status === "ACTIVE",
  ).length;

  // Build role-tailored 4-card KPI structure
  let cards = [];

  if (isFinanceManager) {
    cards = [
      {
        title: "Total Allocated Budget",
        value: `₹${totalAllocated.toLocaleString("en-IN")}`,
        subtitle: `${budgets.length} departmental envelopes registered`,
        badge: { text: `${activeBudgetsCount} Active`, variant: "neutral" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        ),
      },
      {
        title: "Total Capital Utilized",
        value: `₹${totalUsed.toLocaleString("en-IN")}`,
        subtitle: `${utilizationRate}% overall deployment across units`,
        progress: utilizationRate,
        badge: {
          text: `${utilizationRate}% Deployed`,
          variant:
            utilizationRate > 85
              ? "danger"
              : utilizationRate > 70
                ? "warning"
                : "optimal",
        },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        title: "Available Balance",
        value: `₹${availableBudget.toLocaleString("en-IN")}`,
        subtitle: "Unallocated fiscal headroom remaining",
        badge: { text: "Unspent", variant: "optimal" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
      {
        title: "Active Budgets",
        value: `${activeBudgetsCount} / ${budgets.length}`,
        subtitle: "Monitored operational envelopes",
        badge: { text: "Governance", variant: "neutral" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ),
      },
    ];
  } else if (isDeptManager || isOrgAdmin) {
    cards = [
      {
        title: isDeptManager ? "Department Allocation" : "Organization Budget",
        value: `₹${totalAllocated.toLocaleString("en-IN")}`,
        subtitle: `${budgets.length} assigned fiscal envelope${budgets.length === 1 ? "" : "s"}`,
        badge: { text: `${activeBudgetsCount} Active`, variant: "neutral" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        ),
      },
      {
        title: "Capital Deployed",
        value: `₹${totalUsed.toLocaleString("en-IN")}`,
        subtitle: `${utilizationRate}% of cap consumed to date`,
        progress: utilizationRate,
        badge: {
          text: `${utilizationRate}% Spent`,
          variant:
            utilizationRate > 85
              ? "danger"
              : utilizationRate > 70
                ? "warning"
                : "optimal",
        },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        title: "Pending Approvals",
        value: pendingRequests,
        subtitle: `₹${pendingAmount.toLocaleString("en-IN")} awaiting authorization`,
        badge: {
          text:
            pendingRequests > 0
              ? `${pendingRequests} Actionable`
              : "Queue Clear",
          variant: pendingRequests > 0 ? "warning" : "optimal",
        },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
      {
        title: "Approved Disbursements",
        value: approvedRequests,
        subtitle: `₹${approvedAmount.toLocaleString("en-IN")} cleared expenditure`,
        badge: { text: `${approvedRequests} Settled`, variant: "optimal" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
      },
    ];
  } else {
    // Employee
    cards = [
      {
        title: "My Submissions",
        value: requests.length,
        subtitle: "Total financial requests initiated",
        badge: { text: `${requests.length} Total`, variant: "neutral" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        title: "Pending Review",
        value: pendingRequests,
        subtitle: `₹${pendingAmount.toLocaleString("en-IN")} in signoff pipeline`,
        badge: {
          text: pendingRequests > 0 ? `${pendingRequests} In Review` : "Clear",
          variant: pendingRequests > 0 ? "warning" : "optimal",
        },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
      {
        title: "Approved Claims",
        value: approvedRequests,
        subtitle: `₹${approvedAmount.toLocaleString("en-IN")} authorized reimbursement`,
        badge: { text: `${approvedRequests} Cleared`, variant: "optimal" },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
      },
      {
        title: "Declined / Flagged",
        value: rejectedRequests,
        subtitle: "Submissions returned or rejected",
        badge: {
          text: `${rejectedRequests} Declined`,
          variant: rejectedRequests > 0 ? "danger" : "neutral",
        },
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
      },
    ];
  }

  // Fetch budgets when authorized
  useEffect(() => {
    if (!canViewBudgets) return;

    const fetchBudgets = async () => {
      try {
        setBudgetsLoading(true);
        setBudgetsError("");

        const budgetsPromise = getBudgets();
        const canFetchDepts = isFinanceManager || isOrgAdmin;

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
      } catch (err) {
        setBudgetsError(
          err.response?.data?.message || "Failed to load budget data",
        );
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchBudgets();
  }, [canViewBudgets, isFinanceManager, isOrgAdmin]);

  // Fetch financial requests when authorized
  useEffect(() => {
    if (!canViewRequests) return;

    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        setRequestsError("");

        const data = await getFinancialRequests();
        setRequests(data.requests || []);
      } catch (err) {
        setRequestsError(
          err.response?.data?.message || "Failed to load financial requests",
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
      {/* Editorial Welcome Header */}
      <header className="dashboard-hero">
        <div className="dashboard-hero-text">
          <div className="dashboard-eyebrow-row">
            <span className="dashboard-eyebrow-pill">Fiscal Operations</span>
            <span className="dashboard-bullet">&bull;</span>
            <span className="dashboard-role-badge">
              {formatRole(user?.role)}
            </span>
          </div>
          <h1 className="dashboard-greeting font-serif">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="dashboard-subtext">
            {isFinanceManager
              ? "Oversee enterprise department budget allocations, capital pacing, and liquidity reserves."
              : isDeptManager
                ? "Monitor departmental disbursements, approve team requests, and enforce spending caps."
                : isOrgAdmin
                  ? "Global organizational governance, cross-department allocations, and user administration."
                  : "Track your financial requests, expense claims, and review status in real-time."}
          </p>
        </div>

        <div className="dashboard-hero-meta">
          <span className="dashboard-date-badge">
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{todayFormatted}</span>
          </span>

          <div className="dashboard-hero-actions">
            {canCreateRequest && (
              <Link to="/requests/new" className="btn btn-primary btn-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Request</span>
              </Link>
            )}

            {canCreateBudget && (
              <Link to="/budgets/new" className="btn btn-primary btn-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Allocate Budget</span>
              </Link>
            )}
          </div>
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
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
                subtitle={card.subtitle}
                badge={card.badge}
                progress={card.progress}
                icon={card.icon}
              />
            ))}
          </div>
        </section>
      )}

      {/* Split Layout: Main Content Stream vs Right Sidebar */}
      <div className="dashboard-content-split">
        {/* Left Column: Financial Requests Queue or Department Budgets */}
        <div className="dashboard-primary-stream">
          {isFinanceManager ? (
            <section
              className="dashboard-section"
              aria-labelledby="budgets-heading"
            >
              <div className="dashboard-section-header">
                <div>
                  <h2
                    id="budgets-heading"
                    className="dashboard-section-title font-serif"
                  >
                    Department Budgets
                  </h2>
                  <p className="dashboard-section-subtitle">
                    Active spending allocations and cap consumption across
                    organization departments
                  </p>
                </div>
                <div className="dashboard-section-actions">
                  <Link to="/budgets/new" className="btn btn-secondary btn-sm">
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
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New Budget</span>
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
                <div className="budgets-grid">
                  {budgets.length === 0 ? (
                    <div className="state-box">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--color-steel)" }}
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <span className="state-box-title">
                        No departmental budgets found
                      </span>
                      <span className="state-box-desc">
                        Get started by allocating departmental envelopes.
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
            <div className="dashboard-vertical-flow">
              {/* Financial Requests Queue */}
              {canViewRequests && (
                <section
                  className="dashboard-section"
                  aria-labelledby="requests-heading"
                >
                  <div className="dashboard-section-header">
                    <div>
                      <h2
                        id="requests-heading"
                        className="dashboard-section-title font-serif"
                      >
                        {isEmployee
                          ? "My Financial Requests"
                          : "Financial Requests Queue"}
                      </h2>
                      <p className="dashboard-section-subtitle">
                        {isEmployee
                          ? "Track approval progress and disbursement status on your submissions"
                          : "Review, approve, or reject pending spending authorizations"}
                      </p>
                    </div>
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
                </section>
              )}

              {/* Department Budgets for Authorized Managers / Admins */}
              {canViewBudgets && (
                <section
                  className="dashboard-section"
                  aria-labelledby="dept-budgets-heading"
                  style={{ marginTop: canViewRequests ? "2.5rem" : "0" }}
                >
                  <div className="dashboard-section-header">
                    <div>
                      <h2
                        id="dept-budgets-heading"
                        className="dashboard-section-title font-serif"
                      >
                        Department Budget Allocation
                      </h2>
                      <p className="dashboard-section-subtitle">
                        Live spending headroom, utilized capital, and threshold
                        pacing
                      </p>
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
                    <div className="budgets-grid">
                      {budgets.length === 0 ? (
                        <div className="state-box">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ color: "var(--color-steel)" }}
                          >
                            <rect
                              x="2"
                              y="7"
                              width="20"
                              height="14"
                              rx="2"
                              ry="2"
                            />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          <span className="state-box-title">
                            No budgets found
                          </span>
                          <span className="state-box-desc">
                            No active budgets have been allocated for your role
                            or department yet.
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
                </section>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Quick Governance Actions, Compact Activity Stream, & Compliance Seal */}
        <aside
          className="dashboard-sidebar"
          aria-label="Governance and Activity Sidebar"
        >
          {/* 1. Governance Shortcuts Panel (Top Position) */}
          <div className="quick-actions-panel">
            <div className="quick-actions-header">
              <div className="quick-actions-title-group">
                <span className="quick-actions-icon-badge" aria-hidden="true">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <h3 className="quick-actions-title">Governance Shortcuts</h3>
              </div>
              <span className="quick-actions-count-tag">Direct Actions</span>
            </div>

            <div className="quick-actions-grid">
              {canCreateRequest && (
                <Link to="/requests/new" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">New Request</span>
                    <span className="quick-action-tile-meta">Disbursements</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}

              {canCreateBudget && (
                <Link to="/budgets/new" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">Allocate Budget</span>
                    <span className="quick-action-tile-meta">Fiscal Envelopes</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}

              {canViewBudgets && (
                <Link to="/budgets" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">All Budgets</span>
                    <span className="quick-action-tile-meta">Review Caps</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}

              {canManageDepartments && (
                <Link to="/departments" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">Departments</span>
                    <span className="quick-action-tile-meta">Business Units</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}

              {canManageUsers && (
                <Link to="/users" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">Directory</span>
                    <span className="quick-action-tile-meta">Staff &amp; Roles</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}

              {canViewAuditHistory && (
                <Link to="/audit-logs" className="quick-action-tile">
                  <div className="quick-action-tile-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="quick-action-tile-content">
                    <span className="quick-action-tile-title">Audit Ledger</span>
                    <span className="quick-action-tile-meta">Immutable Log</span>
                  </div>
                  <span className="quick-action-tile-arrow">&rarr;</span>
                </Link>
              )}
            </div>
          </div>

          {/* 2. Compact Activity Feed (Positioned Below Shortcuts) */}
          <section
            className="notifications-panel-compact"
            aria-labelledby="notifications-heading"
          >
            <div className="notifications-compact-header">
              <div className="notifications-compact-title-group">
                <span className="notifications-icon-badge-sm" aria-hidden="true">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <h3 id="notifications-heading" className="notifications-compact-title">
                  Activity Feed
                </h3>
                {unreadNotificationsCount > 0 ? (
                  <span className="notifications-count-badge-sm">
                    {unreadNotificationsCount} new
                  </span>
                ) : (
                  <span className="notifications-synced-badge-sm">Synced</span>
                )}
              </div>

              <button
                type="button"
                className="btn-open-drawer-icon"
                onClick={openNotificationDrawer}
                title="Open slide-over notification drawer"
                aria-label="Open slide-over notification drawer"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {notifsLoading ? (
              <div className="notifications-compact-loading">
                <span className="spinner-sm"></span>
                <span>Syncing activity...</span>
              </div>
            ) : notifsError ? (
              <div className="notifications-compact-error">
                <span>{notifsError}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-compact-empty">
                <span className="seal-pulse-dot" style={{ width: 6, height: 6 }} aria-hidden="true"></span>
                <span>All caught up &bull; No unread notices</span>
              </div>
            ) : (
              <div className="notifications-compact-list">
                {notifications.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className={`notification-compact-row ${item.isRead ? "read" : "unread"}`}
                    onClick={() => {
                      if (!item.isRead) handleMarkNotificationAsRead(item._id);
                    }}
                    title={item.isRead ? "Read notification" : "Click to mark as read"}
                    role="button"
                    tabIndex={0}
                  >
                    <span
                      className={`notification-compact-dot ${item.isRead ? "read" : "unread"}`}
                      aria-hidden="true"
                    />
                    <div className="notification-compact-text">
                      <span className="notification-compact-message">
                        {item.message}
                      </span>
                      <span className="notification-compact-time">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="notifications-compact-footer">
              <button
                type="button"
                className="btn-open-center-text"
                onClick={openNotificationDrawer}
              >
                <span>Full Notification Center ({notifications.length})</span>
                <span>&rarr;</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
