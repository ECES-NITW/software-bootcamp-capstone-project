import { useNavigate } from 'react-router-dom'
import useUser from '../hooks/useUser'
import { logout } from '../functions/auth'

function Navbar() {
  const navigate = useNavigate()
  const { data: user } = useUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <button className="navLogo" onClick={() => navigate('/')}>Campus Marketplace</button>
      <div className="navRight">
        {user ? (
          <>
            <span className="navUser">{user.userName}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
