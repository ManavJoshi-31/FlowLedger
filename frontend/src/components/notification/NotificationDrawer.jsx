import { useContext, useState, useEffect } from "react";
import NotificationContext from "../../context/NotificationContext";
import "./NotificationDrawer.css";

function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isDrawerOpen,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useContext(NotificationContext);

  const [filter, setFilter] = useState("ALL"); // ALL or UNREAD

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div
        className="notification-drawer-backdrop"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className="notification-drawer"
        role="dialog"
        aria-label="Notification Center"
        aria-modal="true"
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="drawer-title-group">
              <span className="drawer-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <h2 className="drawer-title font-serif">Notifications</h2>
              {unreadCount > 0 && (
                <span className="drawer-unread-badge">{unreadCount} new</span>
              )}
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={closeDrawer}
              aria-label="Close notifications panel"
            >
              &times;
            </button>
          </div>

          {/* Action Row: Filter tabs & Mark All */}
          <div className="drawer-action-row">
            <div className="drawer-tabs">
              <button
                type="button"
                className={`drawer-tab-btn ${filter === "ALL" ? "active" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                className={`drawer-tab-btn ${filter === "UNREAD" ? "active" : ""}`}
                onClick={() => setFilter("UNREAD")}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="drawer-mark-all-btn"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {loading && (
            <div className="loading-indicator" style={{ padding: "3rem 1rem" }}>
              <span className="spinner"></span>
              <span>Updating stream...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ margin: "1rem" }}>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filteredNotifications.length === 0 ? (
            <div className="state-box" style={{ margin: "2rem 1rem", borderStyle: "solid" }}>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-steel)" }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="state-box-title" style={{ fontSize: "0.95rem" }}>
                {filter === "UNREAD" ? "No unread alerts" : "No notifications yet"}
              </span>
              <span className="state-box-desc" style={{ fontSize: "0.82rem" }}>
                {filter === "UNREAD"
                  ? "All caught up! New fiscal updates will appear here."
                  : "When financial requests are submitted or reviewed, you'll receive updates."}
              </span>
            </div>
          ) : (
            <div className="drawer-notification-list">
              {filteredNotifications.map((notification) => {
                const isUnread = !notification.isRead;
                return (
                  <article
                    key={notification._id}
                    className={`drawer-item ${isUnread ? "unread" : "read"}`}
                  >
                    <div className="drawer-item-top">
                      <div className="drawer-item-indicator-group">
                        {isUnread && <span className="drawer-item-dot" aria-hidden="true" />}
                        <span className="drawer-item-time">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      {isUnread && (
                        <button
                          type="button"
                          className="drawer-item-mark-read"
                          onClick={() => markAsRead(notification._id)}
                          title="Mark this alert as read"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="drawer-item-message">{notification.message}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button
            type="button"
            className="drawer-refresh-btn"
            onClick={refreshNotifications}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Refresh Feed</span>
          </button>
          <span className="drawer-footer-note">FlowLedger Event Stream</span>
        </div>
      </aside>
    </>
  );
}

export default NotificationDrawer;
