import { useState } from "react";

const NotificationBell = ({
  notifications = [],
}) => {

  const [open, setOpen] =
    useState(false);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >

      {/* Bell */}
      <button
        onClick={() =>
          setOpen(!open)
        }
        style={{
          position: "relative",
          background: "none",
          border: "none",
          fontSize: "25px",
          cursor: "pointer",
        }}
      >
        🔔

        {unreadCount > 0 && (

          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: "11px",
              minWidth: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>

        )}

      </button>

      {/* Dropdown */}
      {open && (

        <div
          style={{
            position: "absolute",
            right: 0,
            top: "40px",
            width: "350px",
            maxHeight: "450px",
            overflowY: "auto",
            background: "white",
            borderRadius: "12px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.2)",
            padding: "15px",
            zIndex: 9999,
          }}
        >

          <h3>
            Notifications
          </h3>

          {notifications.length === 0 ? (

            <p>
              No notifications
            </p>

          ) : (

            notifications.map(
              (notification) => (

                <div
                  key={
                    notification._id
                  }
                  style={{
                    padding: "12px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    background:
                      notification.severity ===
                      "EXTREME"
                        ? "#ffe5e5"
                        : "#f5f7fa",
                    borderLeft:
                      "4px solid red",
                  }}
                >

                  <strong>
                    {notification.title}
                  </strong>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    📍{" "}
                    {notification.location}
                  </small>

                </div>

              )
            )

          )}

        </div>

      )}

    </div>
  );
};

export default NotificationBell;