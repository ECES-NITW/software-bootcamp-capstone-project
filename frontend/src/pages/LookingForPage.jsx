import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCreateProduct } from '../hooks/useProducts';
import useUser from '../hooks/useUser';

const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Accessories",
  "Stationery",
  "Others"
];

const CONDITIONS = [
    "Brand New",
    "New",
    "Slightly Used",
    "Good",
    "Old",
    "Needs Repair",
];

function LookingForPage() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: items, isLoading, isError } = useProducts({ type: "looking-for" });
  const createRequestMutation = useCreateProduct();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const requests = items?.filter(item => item.types?.includes("looking-for")) ?? [];

  const handlePostRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !budget) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("condition", condition);
    formData.append("budget", Number(budget));
    formData.append("types", "looking-for");

    try {
      await createRequestMutation.mutateAsync(formData);
      setTitle("");
      setDescription("");
      setBudget("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post request.");
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
            🔍 Looking For Board
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Can't find what you need? Post a request so other NITW students can offer it to you.
          </p>
        </div>
        {isLoggedIn && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel Request" : "✍️ Post a Request"}
          </button>
        )}
      </div>

      {showForm && (
        <form className="glassCard" onSubmit={handlePostRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Lora, serif' }}>Request an Item</h3>
          
          {error && <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</p>}

          <div className="formGroup">
            <label className="formLabel">What item are you looking for? *</label>
            <input 
              type="text" 
              className="formInput" 
              placeholder="e.g. Mechanical engineering drafting board, Lab coat size L..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Description *</label>
            <textarea 
              className="formTextarea" 
              rows="3" 
              placeholder="Provide details about condition requirements, when you need it, and pickup options..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="formGroup">
              <label className="formLabel">Category</label>
              <select className="formSelect" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Preferred Condition</label>
              <select className="formSelect" value={condition} onChange={(e) => setCondition(e.target.value)}>
                {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          <div className="formGroup">
            <label className="formLabel">Your Budget (₹) *</label>
            <input 
              type="number" 
              className="formInput" 
              placeholder="Max budget you are willing to offer" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              min="0"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={createRequestMutation.isPending} style={{ width: '100%' }}>
            {createRequestMutation.isPending ? "Posting Request..." : "🚀 Publish Request"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="statusIndicator">
            <span className="statusDot statusDot-active"></span>
            <span>Loading requests...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
          <p style={{ color: '#fca5a5' }}>Failed to retrieve requests from the board.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-color)', borderRadius: '24px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>📋</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Looking For Board is Empty</h3>
          <p style={{ color: 'var(--text-muted)' }}>No student requests have been posted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map(item => (
            <div key={item._id} className="glassCard" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '28px' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className="cardCategory">{item.category}</span>
                  <span className="listingTypeTag" style={{ background: 'var(--primary)', color: '#fff' }}>
                    Looking For
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }} title={item.title}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{item.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                    BUDGET
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{item.budget ?? item.price}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                    WANTED
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {item.condition}
                  </div>
                </div>

                {isLoggedIn && String(item.seller?._id ?? item.seller) !== String(user.user_id) && (
                  <button
                    className="btn"
                    onClick={() => navigate('/chat', { state: { productId: item._id } })}
                    style={{ fontSize: '0.85rem', padding: '10px 18px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }}
                  >
                    💬 Offer This Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LookingForPage;
