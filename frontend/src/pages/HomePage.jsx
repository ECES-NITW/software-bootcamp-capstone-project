import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <section style={{ textAlign: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
        <h1 style={{ 
          fontFamily: 'Lora, serif', 
          fontSize: '3.5rem', 
          fontWeight: 700, 
          letterSpacing: '-0.5px',
          marginBottom: '20px',
          color: 'var(--primary)',
          lineHeight: '1.2',
          fontStyle: 'italic'
        }}>
          Share More. Waste Less. <br />Your Campus Circle.
        </h1>
        <p style={{ 
          fontSize: '1.15rem', 
          color: 'var(--text-muted)', 
          maxWidth: '650px', 
          margin: '0 auto 36px auto',
          lineHeight: '1.6'
        }}>
          A thoughtfully curated peer-to-peer catalog for NITW students. Rent textbooks, swap graphing calculators, and exchange lab equipment sustainably.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/post-item')}>
            Post an Item
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/feed')}>
            Browse Catalog
          </button>
        </div>
      </section>

    </div>
  );
}

export default HomePage;
