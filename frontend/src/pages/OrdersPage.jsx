import { useUserOrders } from "../hooks/useCheckout";

function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useUserOrders();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "64px",
        }}
      >
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="glassCard"
        style={{
          textAlign: "center",
          padding: "48px",
        }}
      >
        <h3>Unable to load orders</h3>
        <p style={{ color: "var(--text-muted)" }}>Please try again later.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "Lora, serif",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          📦 My Orders
        </h1>

        <p style={{ color: "var(--text-muted)" }}>
          Track your purchases, rental requests, and exchange requests.
        </p>
      </div>

      {orders.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {orders.map((order) => {
            const isRent = order.orderType === "rent";

            const rentalDays =
              isRent && order.rentalStartDate && order.rentalEndDate
                ? Math.max(
                    1,
                    Math.ceil(
                      (new Date(order.rentalEndDate) -
                        new Date(order.rentalStartDate)) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : null;

            return (
              <div
                key={order._id}
                className="glassCard"
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid var(--border-color)",
                      flexShrink: 0,
                    }}
                  >
                    {order.product?.images?.[0]?.url ? (
                      <img
                        src={order.product.images[0].url}
                        alt={order.product?.title || "Product"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>📦</span>
                    )}
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {order.product?.title || "Unknown Product"}
                    </h3>

                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        marginBottom: "4px",
                      }}
                    >
                      Order ID:{" "}
                      <strong style={{ color: "var(--text-main)" }}>
                        {order._id}
                      </strong>
                    </p>

                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Date:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      TYPE
                    </div>

                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.orderType}
                    </div>
                  </div>

                  {isRent && rentalDays && (
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                          marginBottom: "4px",
                        }}
                      >
                        DURATION
                      </div>

                      <div
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        {rentalDays} Days
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      TOTAL
                    </div>

                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                      }}
                    >
                      ₹{Number(order.totalAmount ?? 0).toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <span
                      className="cardBadge"
                      style={{
                        position: "static",
                        background: "var(--bg-secondary)",
                        color: "var(--primary)",
                        borderColor: "var(--primary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="glassCard"
          style={{
            textAlign: "center",
            padding: "48px 0",
            border: "1.5px dashed var(--border-color)",
            borderRadius: "24px",
          }}
        >
          <span
            style={{
              fontSize: "2.5rem",
              display: "block",
              marginBottom: "16px",
            }}
          >
            🛒
          </span>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            No Orders Found
          </h3>

          <p style={{ color: "var(--text-muted)" }}>
            You haven't placed any orders yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
