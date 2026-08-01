import { useNavigate } from 'react-router-dom'
import { useRentExchangeItems } from '../hooks/useRentExchange'
import useUser from '../hooks/useUser'

function MyListingsPage() {
  const navigate = useNavigate()
  const { data: user } = useUser()
  const { data: items, isLoading, isError } = useRentExchangeItems()

  const myItems = items?.filter(item => item.sellerId === user?.id)

  return (
    <div>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>📦 My Listings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Items you've posted.</p>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: '#fca5a5' }}>Failed to load listings.</p>}
      {myItems?.length === 0 && (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't posted anything yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/sell-items')}>Post your first item</button>
        </div>
      )}

      <div className="grid">
        {myItems?.map(item => (
          <div key={item.id} className="productCard" onClick={() => navigate(`/item/${item.id}`)} style={{ cursor: 'pointer' }}>
            <div className="cardImageWrapper">
              <img className="cardImage" src={item.image} alt={item.title} />
              <span className={`cardBadge ${item.type === 'rent' ? 'badge-rent' : 'badge-swap'}`}>{item.type}</span>
            </div>
            <div className="cardBody">
              <span className="cardCategory">{item.category}</span>
              <h3 className="cardTitle">{item.title}</h3>
              <div className="cardFooter">
                <div className="cardPrice">${item.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyListingsPage