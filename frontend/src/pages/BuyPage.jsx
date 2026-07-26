import { useProducts } from '../hooks/useProducts'
import ItemCard from '../components/ItemCard'

function BuyPage() {
  const { data: items, isLoading, isError } = useProducts()

  const forSale = items?.filter(p => p.status !== 'Sold') ?? []

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>🛒 Buy Items</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Items listed for direct sale by students.</p>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading listings...</p>
      ) : isError ? (
        <p style={{ color: '#fca5a5' }}>Failed to load items.</p>
      ) : forSale.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No items for sale right now.</p>
      ) : (
        <div className="grid">
          {forSale.map(product => (
            <ItemCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BuyPage
