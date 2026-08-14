import { useEffect, useState } from "react";
import api from "../api/api";

function ReceivedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchReceivedOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/receivedorders");

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch received orders:", err);

      setError(
        err.response?.data?.message || "Unable to load received orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedOrders();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      setActionLoading(orderId);
      setError("");

      await api.patch(`/orders/accept/${orderId}`);

      alert("Order accepted successfully!");

      await fetchReceivedOrders();
    } catch (err) {
      console.error("Accept order error:", err);

      alert(err.response?.data?.message || "Failed to accept order.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this order?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(orderId);
      setError("");

      await api.patch(`/orders/reject/${orderId}`);

      alert("Order rejected successfully!");

      await fetchReceivedOrders();
    } catch (err) {
      console.error("Reject order error:", err);

      alert(err.response?.data?.message || "Failed to reject order.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          fontSize: "18px",
        }}
      >
        Loading received orders...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Received Orders</h1>

          <p
            style={{
              marginTop: "8px",
              color: "#666",
            }}
          >
            Manage orders received for your listings.
          </p>
        </div>

        <button
          onClick={fetchReceivedOrders}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#ffecec",
            color: "#b00020",
          }}
        >
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>No received orders</h2>

          <p style={{ color: "#666" }}>
            You don't have any orders for your listings yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {orders.map((order) => {
            const product = order.product;
            const buyer = order.buyer;

            const isPending = order.status === "pending";
            const isProcessing = actionLoading === order._id;

            return (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "22px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: "0 0 8px",
                        fontSize: "20px",
                      }}
                    >
                      {product?.title || "Product"}
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                      }}
                    >
                      Order ID: {order._id}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background:
                        order.status === "pending"
                          ? "#fff3cd"
                          : order.status === "accepted"
                            ? "#d4edda"
                            : order.status === "rejected"
                              ? "#f8d7da"
                              : "#e2e3e5",
                      color:
                        order.status === "pending"
                          ? "#856404"
                          : order.status === "accepted"
                            ? "#155724"
                            : order.status === "rejected"
                              ? "#721c24"
                              : "#383d41",
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <hr
                  style={{
                    border: 0,
                    borderTop: "1px solid #eee",
                    margin: "18px 0",
                  }}
                />

                {/* Order details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div>
                    <strong>Buyer</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#555",
                      }}
                    >
                      {buyer?.userName ||
                        buyer?.name ||
                        buyer?.email ||
                        "Unknown buyer"}
                    </p>
                  </div>

                  <div>
                    <strong>Order Type</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#555",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.orderType}
                    </p>
                  </div>

                  <div>
                    <strong>Amount</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#555",
                      }}
                    >
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <strong>Payment</strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#555",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {order.orderType === "rent" && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px",
                      borderRadius: "8px",
                      background: "#f7f7f7",
                    }}
                  >
                    <strong>Rental Period</strong>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: "#555",
                      }}
                    >
                      {order.rentalStartDate
                        ? new Date(order.rentalStartDate).toLocaleDateString()
                        : "N/A"}{" "}
                      →{" "}
                      {order.rentalEndDate
                        ? new Date(order.rentalEndDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {isPending && (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "22px",
                    }}
                  >
                    <button
                      onClick={() => handleAccept(order._id)}
                      disabled={isProcessing}
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#2e7d32",
                        color: "white",
                        fontWeight: "600",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                      }}
                    >
                      {isProcessing ? "Processing..." : "Accept Order"}
                    </button>

                    <button
                      onClick={() => handleReject(order._id)}
                      disabled={isProcessing}
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid #c62828",
                        borderRadius: "8px",
                        background: "white",
                        color: "#c62828",
                        fontWeight: "600",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                      }}
                    >
                      Reject Order
                    </button>
                  </div>
                )}

                {/* Accepted message */}
                {order.status === "accepted" && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#e8f5e9",
                      color: "#2e7d32",
                    }}
                  >
                    ✓ You accepted this order. The buyer can now proceed with
                    payment.
                  </div>
                )}

                {/* Rejected message */}
                {order.status === "rejected" && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#ffebee",
                      color: "#c62828",
                    }}
                  >
                    This order was rejected.
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReceivedOrdersPage;
