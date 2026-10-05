function NotificationItem({ notification, onMarkAsRead }) {
  return (
    <div>
      <p>{notification.message}</p>

      <small>{notification.isRead ? "Read" : "Unread"}</small>

      {!notification.isRead && (
        <button type="button" onClick={() => onMarkAsRead(notification._id)}>
          Mark as read
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
