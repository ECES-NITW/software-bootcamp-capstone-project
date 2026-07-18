import { NavLink } from 'react-router-dom';
import useUser from '../hooks/useUser';

const PageIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
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

function Sidebar() {
  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  return (
    <aside className="sidebar">
      <nav className="sidebarNav">
        <NavLink to="/">Home</NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        <NavLink to="/feed" style={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon /> Browse Catalog
        </NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        <NavLink to="/buy-items" style={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon /> Buy
        </NavLink>
        <NavLink to="/rent-item" style={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon /> Rent
        </NavLink>
        <NavLink to="/sell-items" style={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon /> Sell
        </NavLink>
        <NavLink to="/exchange-item" style={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon /> Exchange
        </NavLink>
        
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.5 }}></div>

        {isLoggedIn && (
          <NavLink to="/chat" style={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon /> Messages
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
