import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useDeleteProduct } from '../hooks/useProducts';
import useUser, { useProfile } from '../hooks/useUser';

const RATING_PLACEHOLDER = 4.5;

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: item, isLoading, isError } = useProduct(id);
  const sellerId = item?.seller?._id ?? item?.seller;
  const { data: contactInfo } = useProfile(sellerId);

  const isOwnProduct = Boolean(user && sellerId && String(sellerId) === String(user.user_id));

  const deleteMutation = useDeleteProduct();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          navigate('/feed');
        },
        onError: (err) => {
          alert("Failed to delete listing: " + (err.response?.data?.message || err.message));
        }
      });
    }
  };

  const handleStartChat = () => {
    navigate('/chat', { state: { productId: id } });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading item details...</span>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
        <p style={{ color: '#fca5a5' }}>Item not found or failed to retrieve details.</p>
        <button className="btn" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const image = item.images?.[0]?.url;
  const sellerName = contactInfo?.userName ?? "Seller";

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>

      <div className="detailLayout">
        <div className="detailMainCol">

          <div className="detailGrid">
            <div>
              {image ? (
                <img src={image} alt={item.title} className="detailImage" />
              ) : (
                <div className="detailImage detailImagePlaceholder">No image</div>
              )}
            </div>

            <div className="detailInfo">

              <div>
                <div className="detailTags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.condition && (
                    <span className="cardBadge badge-rent" style={{ position: 'static' }}>{item.condition}</span>
                  )}
                  <span className="statusIndicator">{item.category}</span>
                  {item.status && <span className="statusIndicator">{item.status}</span>}
                </div>

                <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2.2rem', fontWeight: 700, marginTop: '16px', lineHeight: '1.2' }}>
                  {item.title}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <div>Seller: <strong style={{ color: 'var(--text-main)' }}>{isOwnProduct ? 'You' : sellerName}</strong></div>
                <div>Rating: <span style={{ color: '#b58d63' }}>★ {RATING_PLACEHOLDER}</span></div>
                {item.location && <div>📍 {item.location}</div>}
              </div>

              <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Lora, serif' }}>Description</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
              </div>

              <div className="detailPriceSection">
                {item.type === 'rent' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>RENTAL RATE:</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{item.price}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/week</span>
                      </div>
                    </div>
                    {item.deposit && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '20px', color: 'var(--text-muted)' }}>
                        <span>Security Deposit (Refundable):</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{item.deposit}</span>
                      </div>
                    )}
                    {isLoggedIn ? (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {isOwnProduct ? (
                          <button className="btn" style={{ flex: 1, background: '#fee2e2', border: '1.5px solid #fca5a5', color: '#b91c1c' }} onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete Listing'}
                          </button>
                        ) : (
                          <>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert("Checkout feature is currently a placeholder. Integration code will be added shortly.")}>
                              🔒 Secure Rental Escrow
                            </button>
                            <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }} onClick={handleStartChat}>
                              💬 Chat
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: '#fdf5e6', border: '1.5px dashed var(--secondary)', padding: '16px', borderRadius: '12px', color: 'var(--accent-swap)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                        ⚠️ Authorization required. Please log in or register to rent or chat.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>TRADE PREFERENCES:</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-swap)' }}>
                        🔁 Swap for: {item.preferences}
                      </div>
                    </div>

                    {isLoggedIn ? (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {isOwnProduct ? (
                          <button className="btn" style={{ flex: 1, background: '#fee2e2', border: '1.5px solid #fca5a5', color: '#b91c1c' }} onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete Request'}
                          </button>
                        ) : (
                          <>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert("Checkout feature is currently a placeholder. Integration code will be added shortly.")}>
                              🔒 Secure Checkout
                            </button>
                            <button
                              className="btn"
                              style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }}
                              onClick={handleStartChat}
                            >
                              💬 Chat
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: '#fdf5e6', border: '1.5px dashed var(--secondary)', padding: '16px', borderRadius: '12px', color: 'var(--accent-swap)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                        ⚠️ Authorization required. Please log in or register to buy or chat.
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>

          

        </div>

      </div>

    </div>
  );
}

export default ItemDetailPage;
