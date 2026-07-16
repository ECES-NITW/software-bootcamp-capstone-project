import { useNavigate } from 'react-router-dom'


function Navbar({user}) {
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <button className="navLogo" onClick={() => navigate('/')}>Campus Marketplace</button>
      <div className="navRight">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </header>
  )
}

export default Navbar
