import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useWishlistIds } from '../hooks/useWishlist';
import ItemCard from '../components/ItemCard';

function WishlistPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");

  const { data: items, isLoading, isError } = useProducts({
    category,
    search,
    sort,
  });

  const {
    data: wishlistIds,
    isLoading: isWishlistLoading,
    isError: isWishlistError,
  } = useWishlistIds();

  const wishlistedItems =
    items?.filter((p) => wishlistIds?.includes(String(p._id))) ?? [];

  const categories = ["All", "Electronics", "Books", "Furniture", "Clothing", "Sports", "Accessories", "Stationery", "Others"];

  const loading = isLoading || isWishlistLoading;
  const error = isError || isWishlistError;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>

      <div className="feedHeader">
        <div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>
            ❤️ My Wishlist
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Items you have saved for later.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="formInput searchBar"
            placeholder="🔍 Search wishlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '240px' }}
          />

          <select
            className="formSelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '160px' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="formSelect"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="recent">Recently Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="statusIndicator">
            <span className="statusDot statusDot-active" style={{ animation: 'pulseGlow 1.5s infinite' }}></span>
            <span>Loading wishlist...</span>
          </div>
        </div>
      ) : error ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
          <p style={{ color: '#fca5a5' }}>Failed to retrieve your wishlist.</p>
        </div>
      ) : wishlistedItems.length === 0 ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {wishlistIds?.length === 0
              ? "Your wishlist is empty. Tap 🤍 on any item to save it here."
              : "No wishlisted items match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid">
          {wishlistedItems.map(product => (
            <ItemCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
