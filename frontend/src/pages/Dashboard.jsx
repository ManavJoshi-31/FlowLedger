import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import DashboardCard from "../components/DashboardCard";
import {
  getDashboardNotifications,
  markNotificationAsRead,
} from "../services/dashboardService";
import NotificationItem from "../components/NotificationItem";
import BudgetCard from "../components/BudgetCard";
import { getBudgets } from "../services/budgetService";
import { getFinancialRequests } from "../services/financialRequestService";
import FinancialRequestList from "../components/FinancialRequestList";

function Dashboard() {
  const { user } = useContext(AuthContext);

  // → actual data returned by backend
  const [notifications, setNotifications] = useState([]);

  // → whether the request is currently running
  const [loading, setLoading] = useState(true);

  // → error message we want to show to the user
  const [error, setError] = useState("");

  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const canViewBudgets =
    user?.role === "DEPARTMENT_MANAGER" ||
    user?.role === "FINANCE_MANAGER" ||
    user?.role === "ORGANIZATION_ADMIN";
  const handleRequestUpdated = (updatedRequest) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request._id === updatedRequest._id ? updatedRequest : request,
      ),
    );
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

  const availableBudget = budgets.reduce(
    (total, budget) =>
      total + (Number(budget.totalAmount) - Number(budget.usedAmount)),
    0,
  );

  const cards = [
    {
      title: "Pending Requests",
      value: pendingRequests,
    },
    {
      title: "Approved Requests",
      value: approvedRequests,
    },
  ];

  if (canViewBudgets) {
    cards.push({
      title: "Available Budget",
      value: `₹${availableBudget.toLocaleString("en-IN")}`,
    });
  }

  useEffect(() => {
    if (!canViewBudgets) {
      setBudgets([]);
      setBudgetsLoading(false);
      return;
    }

    const fetchBudgets = async () => {
      try {
        setBudgetsLoading(true);
        setBudgetsError("");

        const data = await getBudgets();

        setBudgets(data.budgets);
      } catch (error) {
        setBudgetsError(
          error.response?.data?.message || "Failed to load budgets",
        );
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchBudgets();
  }, [canViewBudgets]);

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
  }, []);

  return (
    <main>
      <h1>Dashboard</h1>

      {requestsLoading && <p>Loading request statistics...</p>}

      {requestsError && <p>{requestsError}</p>}

      {!requestsLoading && !requestsError && (
        <section>
          <h2>Overview</h2>

          {cards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.value}
            />
          ))}
        </section>
      )}

      {requestsLoading && <p>Loading financial requests...</p>}

      {requestsError && <p>{requestsError}</p>}

      {!requestsLoading && !requestsError && (
        <section>
          <h2>Financial Requests</h2>

          <FinancialRequestList
            requests={requests}
            onRequestUpdated={handleRequestUpdated}
          />
        </section>
      )}

      {loading && <p>Loading notifications...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <section>
          <h2>Notifications</h2>

          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
            ))
          )}
        </section>
      )}

      {canViewBudgets && budgetsLoading && <p>Loading budgets...</p>}

      {canViewBudgets && budgetsError && <p>{budgetsError}</p>}

      {canViewBudgets && !budgetsLoading && !budgetsError && (
        <section>
          <h2>Budgets</h2>

          {budgets.length === 0 ? (
            <p>No budgets found.</p>
          ) : (
            budgets.map((budget) => (
              <BudgetCard key={budget._id} budget={budget} />
            ))
          )}
        </section>
      )}
    </main>
  );
}

export default Dashboard;
