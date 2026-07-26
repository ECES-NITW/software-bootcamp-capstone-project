import { useNavigate } from 'react-router-dom'
import { useRentExchangeItems } from '../hooks/useRentExchange'
import useUser from '../hooks/useUser'

function BuyPage() {
  const navigate = useNavigate()
  const { data: user } = useUser()
  const isLoggedIn = Boolean(user)

  const { data: items, isLoading, isError } = useRentExchangeItems({ type: 'buy' })

  return (
    <div>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>🛒 Buy Items</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Items listed for direct sale by students.</p>

      {isLoading && <p>Loading listings..</p>}
      {isError && <p style={{ color: '#fca5a5' }}>Failed to load items.</p>}
      {items?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No items for sale right now.</p>}

      <div className="grid">
        {items?.map(item => (
          <div key={item.id} className="productCard" onClick={() => navigate(`/item/${item.id}`)} style={{ cursor: 'pointer' }}>
            <div className="cardImageWrapper">
              <img className="cardImage" src={item.image} alt={item.title} />
              <span className="cardBadge badge-rent">buy</span>
            </div>
            <div className="cardBody">
              <span className="cardCategory">{item.category}</span>
              <h3 className="cardTitle">{item.title}</h3>
              <p className="cardDesc">{item.description}</p>
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

export default BuyPage