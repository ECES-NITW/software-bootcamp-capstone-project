import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useProcessCheckout } from '../hooks/useCheckout';

function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [days, setDays] = useState(7);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: item, isLoading, isError } = useProduct(id);
  const checkoutMutation = useProcessCheckout();

  const rentPrice = item ? item.price : 0;
  const depositPrice = item ? (item.deposit || 0) : 0;

  const calculateTotal = () => {
    const dailyRate = rentPrice / 7;
    return (dailyRate * days) + depositPrice;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCVVChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCVV(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
      alert("Please fill in all credit card details.");
      return;
    }

    const payload = {
      itemId: id,
      cardholder: cardName,
      cardNumber: cardNumber,
      days: parseInt(days),
      price: rentPrice,
      deposit: depositPrice
    };

    checkoutMutation.mutate(payload, {
      onSuccess: () => {
        navigate('/chat');
      },
      onError: (err) => {
        alert("Payment Escrow Failed: " + (err.message || err));
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading rental invoice details...</span>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
        <p style={{ color: '#fca5a5' }}>Listing checkout details not found.</p>
        <button className="btn" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>
          🔒 Secure Rental Escrow
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Funds will be held securely in escrow until item is returned safely.
        </p>
      </div>

      <div className="checkoutContainer">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <form className="glassCard" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.2rem', fontWeight: 700 }}>
              Payment Information
            </h3>

            <div className="formGroup">
              <label className="formLabel">Rental Duration (Days)</label>
              <input 
                type="number" 
                className="formInput" 
                value={days} 
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Cardholder Name</label>
              <input 
                type="text" 
                className="formInput" 
                placeholder="e.g. Varshith Mummaneni"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Card Number</label>
              <input 
                type="text" 
                className="formInput" 
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="formGroup">
                <label className="formLabel">Expiration Date</label>
                <input 
                  type="text" 
                  className="formInput" 
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  required
                />
              </div>
              <div className="formGroup">
                <label className="formLabel">CVV</label>
                <input 
                  type="password" 
                  className="formInput" 
                  placeholder="•••"
                  value={cardCVV}
                  onChange={handleCVVChange}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Rental ({days} days @ ${(rentPrice/7).toFixed(2)}/day):</span>
                <span style={{ color: 'var(--text-main)' }}>${((rentPrice / 7) * days).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <span>Refundable Deposit:</span>
                <span style={{ color: 'var(--text-main)' }}>${depositPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '1.5px solid var(--border-color)', paddingTop: '12px' }}>
                <span>Total Escrow Amount:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={checkoutMutation.isPending}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {checkoutMutation.isPending ? 'Processing Escrow...' : '🔒 Confirmed: Fund Escrow'}
            </button>
          </form>

        </div>

        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="creditCardWrapper">
            <div 
              className="creditCard" 
              style={{ 
                transform: isFlipped ? 'rotateY(180deg)' : 'none',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: '0 20px 40px rgba(65, 90, 66, 0.15)'
              }}
            >
              {!isFlipped ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="cardLogo">🏢 NITW Student Union</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>ESCROW CARD</span>
                  </div>
                  <div className="cardChip"></div>
                  <div className="cardNumber">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className="cardDetails">
                    <div>
                      <div className="cardHolderLabel">Cardholder</div>
                      <div className="cardHolderVal">{cardName || "Your Name"}</div>
                    </div>
                    <div>
                      <div className="cardExpiryLabel">Expires</div>
                      <div className="cardExpiryVal">{cardExpiry || "MM/YY"}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div style={{ height: '36px', background: '#000', margin: '0 -24px', marginTop: '8px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', background: '#fff', padding: '6px 12px', borderRadius: '4px', color: '#000' }}>
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>CVV</span>
                    <span style={{ fontFamily: 'Courier New', fontWeight: 700, fontStyle: 'italic' }}>{cardCVV || "•••"}</span>
                  </div>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    This card is secure. Escrow transactions are processed locally using mock algorithms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;
