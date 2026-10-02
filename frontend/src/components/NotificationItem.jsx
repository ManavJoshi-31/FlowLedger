function NotificationItem({ notification }) {
  return (
    <div>
      <p>{notification.message}</p>

      <small>{notification.isRead ? "Read" : "Unread"}</small>
    </div>
  );
}

export default NotificationItem;
