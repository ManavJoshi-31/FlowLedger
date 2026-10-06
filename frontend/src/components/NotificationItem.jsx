import "./NotificationItem.css";

function NotificationItem({ notification, onMarkAsRead }) {
  const isUnread = !notification.isRead;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`notification-item ${isUnread ? "unread" : "read"}`}>
      <div className="notification-main">
        <div className="notification-icon-wrapper" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        <div className="notification-content">
          <p className="notification-message">{notification.message}</p>
          <div className="notification-meta">
            {isUnread ? (
              <>
                <span className="notification-unread-dot" aria-hidden="true"></span>
                <span>Unread</span>
              </>
            ) : (
              <span>Read</span>
            )}
            {notification.createdAt && (
              <>
                <span>&bull;</span>
                <span>{formatDate(notification.createdAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {isUnread && (
        <div className="notification-action">
          <button
            type="button"
            className="notification-read-btn"
            onClick={() => onMarkAsRead(notification._id)}
          >
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationItem;
