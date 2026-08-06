import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProduct } from '../hooks/useProducts';

function ExchangeItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");
  const [preferences, setPreferences] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const createItemMutation = useCreateProduct();

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !description || !preferences) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!imageFile) {
      alert("Please upload at least one item photograph.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("condition", condition);
    formData.append("types", "exchange");
    formData.append("exchangePreferences", preferences);
    formData.append("images", imageFile);

    createItemMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/feed');
      },
      onError: (err) => {
        alert("Failed to publish listing: " + (err.response?.data?.message || err.message || err));
      }
    });
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>
          🔄 List an Item for Exchange/Swap
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Trade items with other students on campus. Zero cash transaction swap system.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <form className="glassCard" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="formGroup">
            <label className="formLabel">Listing Title *</label>
            <input 
              type="text" 
              className="formInput" 
              placeholder="e.g. Sony Wireless Headphones WH-1000XM4..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Description *</label>
            <textarea 
              className="formTextarea" 
              rows="4" 
              placeholder="Describe condition, specifications, age of item, and meet-up preferences..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="formGroup">
              <label className="formLabel">Category</label>
              <select className="formSelect" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Sports">Sports</option>
                <option value="Accessories">Accessories</option>
                <option value="Stationery">Stationery</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Condition</label>
              <select className="formSelect" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="formGroup">
            <label className="formLabel">Preferred Trade Item(s) *</label>
            <input 
              type="text" 
              className="formInput" 
              placeholder="e.g. Apple Pencil (2nd gen), Mechanical Keyboard..." 
              value={preferences} 
              onChange={(e) => setPreferences(e.target.value)} 
              required
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Item Photograph</label>
            <div 
              className="dragDropZone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              style={{ borderColor: dragActive ? 'var(--primary)' : 'var(--border-color)' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="d-none" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
              
              {image ? (
                <img src={image} alt="Preview" className="dragDropPreview" />
              ) : (
                <>
                  <span style={{ fontSize: '2.5rem' }}>📷</span>
                  <p>Drag and drop a photo here, or <strong>browse files</strong></p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={createItemMutation.isPending}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {createItemMutation.isPending ? 'Publishing listing...' : '🚀 Publish Swap Listing'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ExchangeItemPage;
