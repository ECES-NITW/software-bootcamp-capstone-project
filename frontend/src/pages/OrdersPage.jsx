import { useNavigate } from 'react-router-dom';
import { useUserOrders, useReceivedOrders } from '../hooks/useCheckout';
import { usePayOrder } from '../hooks/usePayment';

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
  return order.orderType === 'rent' ? 'RENTAL TOTAL' : order.agreedPrice != null ? 'AGREED PRICE' : 'PURCHASE PRICE';
};

const orderAmount = (order) => {
  if (order.orderType === 'exchange') return order.swapProduct?.title ? `For ${order.swapProduct.title}` : 'Swap requested';
  return `₹${Number(order.totalAmount ?? 0).toFixed(2)}`;
};

const contactLine = (person) => {
  if (!person?.phoneNumber) return null;
  return `${person.userName ?? 'Contact'} · ${person.phoneNumber}`;
};

function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading, isError } = useUserOrders();
  const {
    data: receivedOrders,
    isLoading: isReceivedOrdersLoading,
    isError: isReceivedOrdersError,
  } = useReceivedOrders();
  const payMutation = usePayOrder();

  const handlePay = (e, orderId) => {
    e.stopPropagation();
    payMutation.mutate(orderId, {
      onError: (err) => {
        alert(err.response?.data?.message || err.message || 'Payment failed');
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          📦 My Orders
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your past orders, rental checkouts, and completed transactions.
        </p>
      </div>

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
                      {order.orderType === 'buy' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Payment:{' '}
                          <span style={{ textTransform: 'capitalize' }}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </p>
                      )}
                      {['accepted', 'completed'].includes(order.status) &&
                        contactLine(order.seller) && (
                          <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                            Seller: {contactLine(order.seller)}
                          </p>
                        )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {order.orderType === 'buy' &&
                      order.status === 'accepted' &&
                      order.paymentStatus !== 'paid' && (
                        <button
                          className="btn btn-primary"
                          onClick={(e) => handlePay(e, order._id)}
                          disabled={payMutation.isPending}
                          style={{ padding: '10px 24px' }}
                        >
                          {payMutation.isPending ? 'Processing...' : 'Pay'}
                        </button>
                      )}

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
                      {['accepted', 'completed'].includes(order.status) &&
                        contactLine(order.buyer) && (
                          <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                            Buyer: {contactLine(order.buyer)}
                          </p>
                        )}
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
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
