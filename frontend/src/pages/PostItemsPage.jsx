import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function PostItemPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePost = async () => {
    setError('')

    if (!title || !description || !price || !category) {
      setError('All fields are required.')
      return
    }

    const token = localStorage.getItem('marketplace_token')

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, price: Number(price), category, type: 'buy' })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to post item.')
        return
      }

      navigate(`/item/${data.id}`)
    } catch (err) {
      setError('Could not reach the server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glassCard" style={{ maxWidth: '480px', margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '1.6rem', marginBottom: '20px' }}>Post an item for sale</h1>
      {error && <p style={{ color: '#fca5a5', marginBottom: '12px' }}>{error}</p>}

      <input className="formInput" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: '12px', width: '100%' }} />
      <textarea className="formInput" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ marginBottom: '12px', width: '100%' }} />
      <input className="formInput" type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ marginBottom: '12px', width: '100%' }} />

      <select className="formSelect" value={category} onChange={e => setCategory(e.target.value)} style={{ marginBottom: '20px', width: '100%' }}>
        <option value="">Select category</option>
        <option value="Textbooks">Textbooks</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Bicycle">Bicycle</option>
        <option value="Others">Others</option>
      </select>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePost} disabled={loading}>
        {loading ? 'Posting...' : 'Post item'}
      </button>
    </div>
  )
}

export default PostItemPage