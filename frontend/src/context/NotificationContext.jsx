import { createContext, useContext, useEffect, useState, useCallback } from "react";
import AuthContext from "./AuthContext";
import {
  getDashboardNotifications,
  markNotificationAsRead,
} from "../services/dashboardService";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Optimistic update
      setNotifications((current) =>
        current.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      fetchNotifications(); // Rollback on failure
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));

    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n._id)));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
