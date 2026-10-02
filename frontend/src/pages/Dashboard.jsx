import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { getDashboardNotifications } from "../services/dashboardService";

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

      {!loading && !error && <p>Notifications: {notifications.length}</p>}

      {cards.map((card) => (
        <DashboardCard key={card.title} title={card.title} value={card.value} />
      ))}
    </main>
  );
}

export default Dashboard;
