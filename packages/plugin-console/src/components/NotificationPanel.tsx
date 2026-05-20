import { useNotificationStore } from "../hooks/useNotificationStore";

export function NotificationPanel() {
  const { notifications, unreadCount, markAllRead, markRead, deleteNotification } = useNotificationStore();
  return (
    <section aria-label="Notification center" style={{ display: "grid", gap: 10 }}>
      <header style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <strong>Notifications</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ color: "#6b7280", fontSize: 12 }}>{unreadCount} unread</span>
          <button onClick={() => void markAllRead()} type="button">Mark all read</button>
        </div>
      </header>
      <div style={{ display: "grid", gap: 8 }}>
        {notifications.map((notification) => (
          <article
            key={notification.id}
            style={{
              background: notification.read ? "#ffffff" : "#f0f9ff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              display: "grid",
              gap: 6,
              padding: 10,
            }}
          >
            <header style={{ alignItems: "center", display: "flex", gap: 8 }}>
              <strong>{notification.title}</strong>
              <span style={{ color: "#6b7280", fontSize: 12 }}>{notification.sourcePlugin}</span>
              <time dateTime={notification.createdAt} style={{ color: "#6b7280", fontSize: 12, marginLeft: "auto" }}>
                {new Date(notification.createdAt).toLocaleString()}
              </time>
            </header>
            <p style={{ margin: 0 }}>{notification.body}</p>
            <footer style={{ display: "flex", gap: 8 }}>
              <button onClick={() => void markRead(notification.id)} type="button">Read</button>
              <button onClick={() => void deleteNotification(notification.id)} type="button">Delete</button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
