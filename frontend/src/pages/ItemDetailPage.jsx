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
  const [activeImage, setActiveImage] = useState(0);

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

  const images = item.images ?? [];
  const image = images[activeImage]?.url ?? images[0]?.url;
  const sellerName = contactInfo?.userName ?? "Seller";
  const sellerInitials = (isOwnProduct ? user?.userName : sellerName)?.substring(0, 2).toUpperCase() ?? "??";

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

      <button className="detailBackBtn" onClick={() => navigate(-1)}>
        ← Back to listings
      </button>

      <div className="detailLayout">
        <div className="detailMainCol">

          <div className="detailPanel">
            <div className="detailGrid">

              <div className="detailGallery">
                <div className="detailImageWrapper">
                  {image ? (
                    <img src={image} alt={item.title} className="detailImage" />
                  ) : (
                    <div className="detailImage detailImagePlaceholder">No image</div>
                  )}
                  {item.condition && (
                    <span className="cardBadge badge-rent">{item.condition}</span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="detailThumbs">
                    {images.map((img, index) => (
                      <img
                        key={img.public_id ?? index}
                        src={img.url}
                        alt={`${item.title} ${index + 1}`}
                        className={`detailThumb ${index === activeImage ? 'active' : ''}`}
                        onClick={() => setActiveImage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="detailInfo">

                <div>
                  <div className="detailTags" style={{ flexWrap: 'wrap' }}>
                    <span className="statusIndicator">
                      <span className="statusDot statusDot-active"></span>
                      {item.category}
                    </span>
                    {item.status && (
                      <span className="statusIndicator">
                        <span className={`statusDot ${item.status === 'Available' ? 'statusDot-active' : 'statusDot-pending'}`}></span>
                        {item.status}
                      </span>
                    )}
                  </div>

                  <h1 className="detailTitle">{item.title}</h1>
                </div>

                <div className="detailSellerCard">
                  <div className="detailSellerAvatar">{sellerInitials}</div>
                  <div>
                    <div className="detailSellerName">{isOwnProduct ? 'You' : sellerName}</div>
                    <div className="detailSellerMeta">
                      {item.location ? <>📍 {item.location}</> : 'Campus seller'}
                    </div>
                  </div>
                </div>

                <div className="detailDescription">
                  <h3>Description</h3>
                  <p>{item.description}</p>
                </div>

                <div className="detailPriceSection">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="detailPriceLabel">Price</div>
                    <div className="detailPriceValue">${item.price}</div>
                  </div>

                  {isLoggedIn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/checkout/${item._id}`)}>
                        🔒 Secure Checkout
                      </button>
                      {!isOwnProduct && (
                        <button
                          className="btn"
                          style={{ width: '100%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }}
                          onClick={() => setShowChat(true)}
                        >
                          💬 Chat
                        </button>
                      )}
                      {!isOwnProduct && (
                        <button
                          className="btn"
                          style={{
                            width: '100%',
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
