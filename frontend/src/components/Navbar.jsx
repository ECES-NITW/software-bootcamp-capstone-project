import { useNavigate } from 'react-router-dom'
import useUser from '../hooks/useUser'
import { logout } from '../functions/auth'

function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { data: user } = useUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onMenuClick && (
          <button
            className="navMenuBtn"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <button className="navLogo" onClick={() => navigate('/')}>Campus Marketplace</button>
      </div>
      <div className="navRight">
        {user ? (
          <>
            <span className="navUser" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>{user.userName}</span>
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
