<<<<<<< HEAD
import { useUserOrders } from "../hooks/useCheckout";

function OrdersPage() {
  const { data: orders, isLoading, isError, error } = useUserOrders();
=======
import { useNavigate } from 'react-router-dom';
import { useUserOrders, useReceivedOrders } from '../hooks/useCheckout';

const ORDER_TYPE_LABELS = { buy: 'Sell', rent: 'Rent', exchange: 'Exchange' };

const rentalDays = (order) => {
  if (!order.rentalStartDate || !order.rentalEndDate) return null;
  const days = Math.ceil(
    (new Date(order.rentalEndDate) - new Date(order.rentalStartDate)) / (1000 * 60 * 60 * 24),
  );
  return days > 0 ? days : null;
};

const orderAmountLabel = (order) => {
  if (order.orderType === 'exchange') return 'EXCHANGE';
  return order.orderType === 'rent' ? 'RENTAL RATE' : order.agreedPrice != null ? 'AGREED PRICE' : 'PURCHASE PRICE';
};

const orderAmount = (order) => {
  if (order.orderType === 'exchange') return order.swapProduct?.title ? `For ${order.swapProduct.title}` : 'Swap requested';
  const amount = `₹${Number(order.totalAmount ?? 0).toFixed(2)}`;
  return order.orderType === 'rent' ? `${amount} / week` : amount;
};

function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading, isError } = useUserOrders();
  const {
    data: receivedOrders,
    isLoading: isReceivedOrdersLoading,
    isError: isReceivedOrdersError,
  } = useReceivedOrders();
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95

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

<<<<<<< HEAD
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
=======
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
            As Buyer
          </h2>
          {isError ? (
            <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-color)', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Could Not Load Orders</h3>
              <p style={{ color: 'var(--text-muted)' }}>Something went wrong while fetching your orders. Please try again later.</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => (
                <div key={order._id} className="glassCard" onClick={() => order.product?._id && navigate(`/item/${order.product._id}`)} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '24px', cursor: order.product?._id ? 'pointer' : 'default' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                      {order.product?.images?.[0]?.url ? (
                        <img src={order.product.images[0].url} alt={order.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                        {order.product?.title || 'Unknown Product'}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
                        Type: <strong style={{ color: 'var(--text-main)' }}>{ORDER_TYPE_LABELS[order.orderType] || order.orderType}</strong>
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {rentalDays(order) && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                          DURATION
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                          {rentalDays(order)} Days
                        </div>
                      </div>
                    )}

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                        {orderAmountLabel(order)}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {orderAmount(order)}
                      </div>
                    </div>

                    <div>
                      <span className="cardBadge" style={{ position: 'static', background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--primary)', borderWidth: '1px', borderStyle: 'solid', textTransform: 'capitalize' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-color)', borderRadius: '24px' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🛒</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Orders Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't rented or purchased any items yet.</p>
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
            As Seller
          </h2>
          {isReceivedOrdersLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading received orders...</p>
          ) : isReceivedOrdersError ? (
            <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-color)', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Could Not Load Listings</h3>
              <p style={{ color: 'var(--text-muted)' }}>Something went wrong while fetching your listings. Please try again later.</p>
            </div>
          ) : receivedOrders && receivedOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {receivedOrders.map((order) => (
                <div
                  key={order._id}
                  className="glassCard"
                  onClick={() => order.product?._id && navigate(`/item/${order.product._id}`)}
                  style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '24px', cursor: order.product?._id ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                      {order.product?.images?.[0]?.url ? (
                        <img src={order.product.images[0].url} alt={order.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                        {order.product?.title || 'Unknown Product'}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Type: {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                        {orderAmountLabel(order)}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {orderAmount(order)}
                      </div>
                    </div>

                    <div>
                      <span className="cardBadge" style={{ position: 'static', background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--primary)', borderWidth: '1px', borderStyle: 'solid' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-color)', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Sales Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>None of your listings have been sold or reserved yet.</p>
            </div>
          )}
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
