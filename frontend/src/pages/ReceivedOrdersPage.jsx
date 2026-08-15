import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReceivedOrders } from "../hooks/useCheckout";
import api from "../api/api";

const ORDER_TYPE_LABELS = { buy: "Purchase", rent: "Rental", exchange: "Exchange" };

const orderAmountLabel = (order) => {
  if (order.orderType === "exchange") return "EXCHANGE";
  return order.orderType === "rent"
    ? "RENTAL TOTAL"
    : order.agreedPrice != null
      ? "AGREED PRICE"
      : "PURCHASE PRICE";
};

const orderAmount = (order) => {
  if (order.orderType === "exchange")
    return order.swapProduct?.title
      ? `For ${order.swapProduct.title}`
      : "Swap requested";
  return `₹${Number(order.totalAmount ?? 0).toFixed(2)}`;
};

function ReceivedOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allOrders = [], isLoading, isError } = useReceivedOrders();
  const orders = allOrders.filter((order) => order.status !== "completed");
  const [feedback, setFeedback] = useState("");

  const respondMutation = useMutation({
    mutationFn: async ({ orderId, action }) => {
      const response = await api.patch(`/orders/${action}/${orderId}`);
      return response.data;
    },
    onSuccess: (data) => {
      setFeedback(data.message || "Order updated.");
      queryClient.invalidateQueries({ queryKey: ["received_orders"] });
      queryClient.invalidateQueries({ queryKey: ["user_orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
    onError: (err) => {
      setFeedback(err.response?.data?.message || "Failed to update the order.");
    },
  });

  const respond = (orderId, action) => {
    if (
      action === "reject" &&
      !window.confirm("Are you sure you want to reject this order?")
    ) {
      return;
    }
    setFeedback("");
    respondMutation.mutate({ orderId, action });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading received orders...</span>
        </div>
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
          Received Orders
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Review incoming requests for your listings and respond to them.
        </p>
      </div>

      {feedback && (
        <div
          className="glassCard"
          style={{
            padding: "14px 20px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            color: "var(--primary)",
          }}
        >
          {feedback}
        </div>
      )}

      {isError ? (
        <div
          className="glassCard"
          style={{
            textAlign: "center",
            padding: "48px 0",
            border: "1.5px dashed var(--border-color)",
            borderRadius: "24px",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
            Could Not Load Orders
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            Something went wrong while fetching your received orders.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div
          className="glassCard"
          style={{
            textAlign: "center",
            padding: "48px 0",
            border: "1.5px dashed var(--border-color)",
            borderRadius: "24px",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
            No Received Orders
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            Requests from buyers will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => {
            const isPending = order.status === "pending";
            const isBusy =
              respondMutation.isPending &&
              respondMutation.variables?.orderId === order._id;

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
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div
                    onClick={() =>
                      order.product?._id && navigate(`/item/${order.product._id}`)
                    }
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
                      cursor: order.product?._id ? "pointer" : "default",
                    }}
                  >
                    {order.product?.images?.[0]?.url ? (
                      <img
                        src={order.product.images[0].url}
                        alt={order.product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span
                        style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                      >
                        No image
                      </span>
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
                      Type:{" "}
                      <strong style={{ color: "var(--text-main)" }}>
                        {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                      </strong>
                      {" · "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      From: {order.buyer?.userName || "Buyer"}
                      {["accepted", "completed"].includes(order.status) &&
                        order.buyer?.phoneNumber && (
                          <strong style={{ color: "var(--primary)" }}>
                            {" "}
                            · {order.buyer.phoneNumber}
                          </strong>
                        )}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      Payment:{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {order.paymentStatus || "pending"}
                      </span>
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
                        marginBottom: "2px",
                      }}
                    >
                      {orderAmountLabel(order)}
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--text-main)",
                      }}
                    >
                      {orderAmount(order)}
                    </div>
                  </div>

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

                  {isPending && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => respond(order._id, "accept")}
                        disabled={isBusy}
                        style={{ padding: "10px 20px" }}
                      >
                        {isBusy ? "Working..." : "Accept"}
                      </button>
                      <button
                        className="btn"
                        onClick={() => respond(order._id, "reject")}
                        disabled={isBusy}
                        style={{
                          padding: "10px 20px",
                          background: "#fee2e2",
                          border: "1.5px solid #fca5a5",
                          color: "#b91c1c",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {["pending", "accepted"].includes(order.status) && (
                    <button
                      className="btn"
                      onClick={() => respond(order._id, "complete")}
                      disabled={isBusy}
                      style={{
                        padding: "10px 20px",
                        background: "var(--bg-secondary)",
                        border: "1.5px solid var(--primary)",
                        color: "var(--primary)",
                        fontWeight: 700,
                      }}
                    >
                      {isBusy ? "Working..." : "Mark as Sold"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReceivedOrdersPage;
