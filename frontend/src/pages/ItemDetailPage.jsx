import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useDeleteProduct, listingPrice, PLACEHOLDER_IMAGE } from '../hooks/useProducts';
import useUser, { useProfile } from '../hooks/useUser';
import { useWishlistIds, useToggleWishlist } from '../hooks/useWishlist';
import { useAgreedPrice } from '../hooks/useChat';

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);

  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: item, isLoading, isError } = useProduct(id);
  const sellerId = item?.seller?._id ?? item?.seller;
  const { data: contactInfo } = useProfile(sellerId);

  const isOwnProduct = Boolean(user && sellerId && String(sellerId) === String(user.user_id));

  const deleteMutation = useDeleteProduct();

  const { data: wishlistIds } = useWishlistIds();
  const toggleWishlistMutation = useToggleWishlist();
  const isWishlisted = Boolean(wishlistIds?.includes(String(id)));

  const { data: agreedPrice } = useAgreedPrice(id);
  const hasAgreedPrice = isLoggedIn && agreedPrice != null;

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

  const images = item.images ?? [];
  const image = images[activeImage]?.url ?? images[0]?.url;

  const types = item.types ?? [];
  const canSell = types.includes("sell");
  const canRent = types.includes("rent");
  const canExchange = types.includes("exchange");
  const sellerName = contactInfo?.userName ?? "Seller";
  const sellerInitials = (isOwnProduct ? user?.userName : sellerName)?.substring(0, 2).toUpperCase() ?? "??";

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
                  <img
                    src={image || PLACEHOLDER_IMAGE}
                    alt={item.title}
                    className="detailImage"
                  />
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
                  <div className="detailPriceRows">
                    {canSell && (
                      <div className="detailPriceRow">
                        <div className="detailPriceLabel">
                          {hasAgreedPrice ? 'Agreed Price' : 'Price'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                          {hasAgreedPrice && (
                            <span
                              style={{
                                fontSize: '1rem',
                                color: 'var(--text-muted)',
                                textDecoration: 'line-through',
                              }}
                            >
                              ₹{item.price}
                            </span>
                          )}
                          <div
                            className="detailPriceValue"
                            style={hasAgreedPrice ? { color: '#2e8b57' } : undefined}
                          >
                            ₹{hasAgreedPrice ? agreedPrice : item.price}
                          </div>
                        </div>
                      </div>
                    )}

                    {!canSell && hasAgreedPrice && (
                      <div className="detailPriceRow">
                        <div className="detailPriceLabel">Agreed Price</div>
                        <div className="detailPriceValue" style={{ color: '#2e8b57' }}>
                          ₹{agreedPrice}
                        </div>
                      </div>
                    )}

                    {canRent && (
                      <div className="detailPriceRow">
                        <div>
                          <div className="detailPriceLabel">Rent</div>
                          {item.deposit > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                              Refundable deposit ₹{item.deposit}
                            </div>
                          )}
                        </div>
                        <div className="detailPriceValue">
                          ₹{item.rentPrice}
                          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> /week</span>
                        </div>
                      </div>
                    )}

                    {canExchange && (
                      <div className="detailPriceRow">
                        <div>
                          <div className="detailPriceLabel">Exchange</div>
                          {item.exchangePreferences && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                              Wants: {item.exchangePreferences}
                            </div>
                          )}
                        </div>
                        <span className="listingTypeTag tag-exchange">Open to swaps</span>
                      </div>
                    )}

                    {!canSell && !canRent && !canExchange && (
                      <div className="detailPriceRow">
                        <div className="detailPriceLabel">Budget</div>
                        <div className="detailPriceValue">₹{listingPrice(item)}</div>
                      </div>
                    )}
                  </div>

                  {isLoggedIn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {isOwnProduct ? (
                        <button
                          className="btn"
                          style={{ width: '100%', background: '#fee2e2', border: '1.5px solid #fca5a5', color: '#b91c1c' }}
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete Listing'}
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/checkout/${item._id}`)}>
                            🔒 Secure Checkout
                          </button>
                          <button
                            className="btn"
                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }}
                            onClick={handleStartChat}
                          >
                            💬 Chat
                          </button>
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
                        </>
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
      </div>

    </div>
  );
}

export default ItemDetailPage;
