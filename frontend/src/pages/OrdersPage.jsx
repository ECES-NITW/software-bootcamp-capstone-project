import { useUserOrders } from "../hooks/useCheckout";

function OrdersPage() {
  const { data: orders, isLoading, isError, error } = useUserOrders();

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
          color: "#ef4444",
        }}
      >
        Failed to load orders.
        <br />
        <small>{error?.response?.data?.message || error?.message}</small>
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
          Track your orders, rental requests, and transactions.
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {orders.map((order) => {
            const amount = Number(order.totalAmount ?? 0);

            const orderType = order.orderType?.toUpperCase() || "ORDER";

            let duration = "—";

            if (order.orderType === "rent") {
              if (order.rentalStartDate && order.rentalEndDate) {
                const start = new Date(order.rentalStartDate);
                const end = new Date(order.rentalEndDate);

                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

                duration = `${days} Days`;
              } else {
                duration = "Rental";
              }
            } else if (order.orderType === "buy") {
              duration = "One-time purchase";
            } else if (order.orderType === "exchange") {
              duration = "Exchange";
            }

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
                {/* PRODUCT INFO */}
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
                        marginBottom: "4px",
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
                        : "—"}
                    </p>

                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        marginTop: "4px",
                      }}
                    >
                      Type:{" "}
                      <strong style={{ color: "var(--text-main)" }}>
                        {orderType}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* ORDER DETAILS */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* DURATION */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        marginBottom: "2px",
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
                      {duration}
                    </div>
                  </div>

                  {/* TOTAL AMOUNT */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        marginBottom: "2px",
                      }}
                    >
                      TOTAL AMOUNT
                    </div>

                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--text-main)",
                      }}
                    >
                      ₹{amount.toFixed(2)}
                    </div>
                  </div>

                  {/* STATUS */}
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
                      {order.status || "pending"}
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
