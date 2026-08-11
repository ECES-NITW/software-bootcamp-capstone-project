import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import useUser from '../hooks/useUser';
import ItemCard from '../components/ItemCard';

function FeedPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");

  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: items, isLoading, isError } = useProducts({
    category,
    type,
    search,
    sort
  });

  // Only show other students' items, not your own listings
  const visibleItems = user
    ? items?.filter(
        (p) => String(p.seller?._id ?? p.seller) !== String(user.user_id),
      )
    : items;

  const categories = ["All", "Electronics", "Books", "Furniture", "Clothing", "Sports", "Accessories", "Stationery", "Others"];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      {!isLoggedIn && (
        <div className="restrictedBanner" style={{ background: 'rgba(217, 119, 6, 0.05)', borderColor: 'rgba(217, 119, 6, 0.25)', color: '#b45309', marginBottom: '24px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <strong>Guest Mode:</strong> You are viewing items in the browse channel. Log in or register an account to unlock checkout payments and chat options.
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="restrictedBanner" style={{ background: 'rgba(65, 90, 66, 0.05)', borderColor: 'rgba(65, 90, 66, 0.2)', color: '#3d5a45', marginBottom: '24px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔑</span>
          <div>
            <strong>Authorized Mode:</strong> Full features unlocked. You are logged in as <strong>{user?.userName}</strong>.
          </div>
        </div>
      )}

      <div className="feedHeader">
        <div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>
            🎒 Browse Channel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse books, calculators, and lab gear listed by students.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="formInput searchBar" 
              placeholder="🔍 Search items..." 
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

          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '14px', width: 'fit-content', border: '1.5px solid var(--border-color)' }}>
            <button 
              className={`toggleTab ${type === 'all' ? 'active-rent' : ''}`} 
              onClick={() => setType('all')}
              style={{ padding: '8px 24px' }}
            >
              All Types
            </button>
            <button 
              className={`toggleTab ${type === 'rent' ? 'active-rent' : ''}`} 
              onClick={() => setType('rent')}
              style={{ padding: '8px 24px' }}
            >
              Rentals
            </button>
            <button 
              className={`toggleTab ${type === 'exchange' ? 'active-swap' : ''}`}
              onClick={() => setType('exchange')}
              style={{ padding: '8px 24px' }}
            >
              Swaps
            </button>
            <button 
              className="toggleTab disabled" 
              disabled
              style={{ padding: '8px 24px' }}
            >
              🔒 Buy (Sales)
            </button>
          </div>

        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="statusIndicator">
            <span className="statusDot statusDot-active" style={{ animation: 'pulseGlow 1.5s infinite' }}></span>
            <span>Loading listings...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
          <p style={{ color: '#fca5a5' }}>Failed to retrieve listings from the API.</p>
        </div>
      ) : visibleItems?.length === 0 ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No items found matching your filters.</p>
        </div>
      ) : (
        <div className="grid">
          {visibleItems?.map(product => (
            <ItemCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedPage;
