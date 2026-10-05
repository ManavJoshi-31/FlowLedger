import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import {
  getDashboardNotifications,
  markNotificationAsRead,
} from "../services/dashboardService";
import NotificationItem from "../components/NotificationItem";
import BudgetCard from "../components/BudgetCard";
import { getBudgets } from "../services/budgetService";
import { getFinancialRequests } from "../services/financialRequestService";
function Dashboard() {
  //→ actual data returned by backend
  const [notifications, setNotifications] = useState([]);

  //→ whether the request is currently running
  const [loading, setLoading] = useState(true);

  //→ error message we want to show to the user
  const [error, setError] = useState("");

  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
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
    {
      title: "Available Budget",
      value: `₹${availableBudget.toLocaleString("en-IN")}`,
    },
  ];

  useEffect(() => {
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
  }, []);

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

      {!requestsLoading &&
        !requestsError &&
        !budgetsLoading &&
        !budgetsError && (
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
      {budgetsLoading && <p>Loading budgets...</p>}

      {budgetsError && <p>{budgetsError}</p>}

      {!budgetsLoading && !budgetsError && (
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
