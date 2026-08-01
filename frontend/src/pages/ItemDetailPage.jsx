import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import useUser, { useProfile } from '../hooks/useUser';
import { useWishlistIds, useToggleWishlist } from '../hooks/useWishlist';
import useMediaQuery from '../hooks/useMediaQuery';
import ProductChatWrapper from '../components/ProductChatWrapper';

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 900px)');

  const [showChat, setShowChat] = useState(false);

  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: item, isLoading, isError } = useProduct(id);
  const sellerId = item?.seller?._id ?? item?.seller;
  const { data: contactInfo } = useProfile(sellerId);

  const isOwnProduct = Boolean(user && sellerId && String(sellerId) === String(user.user_id));

  const { data: wishlistIds } = useWishlistIds();
  const toggleWishlistMutation = useToggleWishlist();
  const isWishlisted = Boolean(wishlistIds?.includes(String(id)));

  useEffect(() => {
    if (location.state?.showChat) setShowChat(true);
  }, [location.state]);

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

  const chatOpen = showChat && !isOwnProduct;

  const chatPanel = (
    <ProductChatWrapper
      productId={id}
      productInfo={item}
      contactInfo={contactInfo}
      onClose={() => setShowChat(false)}
    />
  );

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
                {item.location && <div>📍 {item.location}</div>}
              </div>

              <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Lora, serif' }}>Description</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
              </div>

              <div className="detailPriceSection">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRICE:</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>${item.price}</div>
                </div>

                {isLoggedIn ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/checkout/${item._id}`)}>
                      🔒 Secure Checkout
                    </button>
                    {!isOwnProduct && (
                      <button
                        className="btn"
                        style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }}
                        onClick={() => setShowChat(true)}
                      >
                        💬 Chat
                      </button>
                    )}
                    {!isOwnProduct && (
                      <button
                        className="btn"
                        style={{
                          background: isWishlisted ? 'rgba(220, 38, 38, 0.08)' : 'var(--bg-secondary)',
                          border: `1.5px solid ${isWishlisted ? '#dc2626' : 'var(--border-color)'}`,
                          color: isWishlisted ? '#dc2626' : 'var(--primary)',
                        }}
                        onClick={() => toggleWishlistMutation.mutate(id)}
                        disabled={toggleWishlistMutation.isPending}
                      >
                        {isWishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#fdf5e6', border: '1.5px dashed var(--secondary)', padding: '16px', borderRadius: '12px', color: 'var(--accent-swap)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                    ⚠️ Authorization required. Please log in or register to buy or chat.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {chatOpen && isDesktop && (
          <aside className="detailChatSide">
            {chatPanel}
          </aside>
        )}
      </div>

      {chatOpen && !isDesktop && (
        <div className="detailChatOverlay">
          {chatPanel}
        </div>
      )}

    </div>
  );
}

export default ItemDetailPage;
