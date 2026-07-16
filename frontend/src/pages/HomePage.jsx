import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate('/feed')}>Go to Feed</button>
    </div>
  )
}

export default HomePage
