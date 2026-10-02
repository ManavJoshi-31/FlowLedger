import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { getDashboardNotifications } from "../services/dashboardService";
import NotificationItem from "../components/NotificationItem";
import BudgetCard from "../components/BudgetCard";
import { getBudgets } from "../services/budgetService";
function Dashboard() {
  //→ actual data returned by backend
  const [notifications, setNotifications] = useState([]);

  //→ whether the request is currently running
  const [loading, setLoading] = useState(true);

  //→ error message we want to show to the user
  const [error, setError] = useState("");

  const cards = [
    {
      title: "Pending Requests",
      value: 5,
    },
    {
      title: "Approved Requests",
      value: 12,
    },
    {
      title: "Available Budget",
      value: "₹4,50,000",
    },
  ];
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState("");
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

  return (
    <main>
      <h1>Dashboard</h1>

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
