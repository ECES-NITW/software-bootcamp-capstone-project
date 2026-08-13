import { NavLink } from 'react-router-dom';
import useUser from '../hooks/useUser';

const iconStyle = { marginRight: '10px', flexShrink: 0, opacity: 0.8 };

const StoreIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={iconStyle}
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={iconStyle}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={iconStyle}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={iconStyle}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={iconStyle}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChatIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '10px', flexShrink: 0, opacity: 0.8 }}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: '10px', flexShrink: 0, opacity: 0.8 }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function Sidebar() {
  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  return (
    <aside className="sidebar">
      <nav className="sidebarNav">
        <NavLink to="/">Home</NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        <NavLink to="/feed" style={{ display: 'flex', alignItems: 'center' }}>
          <StoreIcon /> Market Place
        </NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        <NavLink to="/looking-for" style={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon /> Looking For
        </NavLink>
        <NavLink to="/post-item" style={{ display: 'flex', alignItems: 'center' }}>
          <PlusCircleIcon /> Post an Item
        </NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        {isLoggedIn && (
          <>
            <NavLink to="/chat" style={{ display: 'flex', alignItems: 'center' }}>
              <ChatIcon /> Messages
            </NavLink>
            <NavLink to="/orders" style={{ display: 'flex', alignItems: 'center' }}>
              <PackageIcon /> My Orders
            </NavLink>
            <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
              <UserIcon /> My Profile
            </NavLink>
          </>
        )}
        {isLoggedIn && (
          <NavLink to="/wishlist" style={{ display: 'flex', alignItems: 'center' }}>
            <HeartIcon /> Wishlist
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
