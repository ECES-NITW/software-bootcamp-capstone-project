import { NavLink } from "react-router-dom";
import useUser from "../hooks/useUser";

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
    style={{ marginRight: "10px", flexShrink: 0, opacity: 0.8 }}
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
    style={{ marginRight: "10px", flexShrink: 0, opacity: 0.8 }}
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
    style={{ marginRight: "10px", flexShrink: 0, opacity: 0.8 }}
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

        <div
          style={{
            margin: "8px 0",
            borderBottom: "1px solid var(--border-color)",
            opacity: 0.5,
          }}
        ></div>

        <NavLink to="/feed" style={{ display: "flex", alignItems: "center" }}>
          <PageIcon /> Browse Catalog
        </NavLink>

        <div
          style={{
            margin: "8px 0",
            borderBottom: "1px solid var(--border-color)",
            opacity: 0.5,
          }}
        ></div>

        <NavLink
          to="/looking-for"
          style={{ display: "flex", alignItems: "center" }}
        >
          <PageIcon /> Looking For
        </NavLink>
        <NavLink
          to="/post-item"
          style={{ display: "flex", alignItems: "center" }}
        >
          <PageIcon /> Post an Item
        </NavLink>

        <div
          style={{
            margin: "8px 0",
            borderBottom: "1px solid var(--border-color)",
            opacity: 0.5,
          }}
        ></div>

        {isLoggedIn && (
          <>
            <NavLink
              to="/chat"
              style={{ display: "flex", alignItems: "center" }}
            >
              <ChatIcon /> Messages
            </NavLink>
            <NavLink
              to="/orders"
              style={{ display: "flex", alignItems: "center" }}
            >
              <PageIcon /> My Orders
            </NavLink>

            <NavLink
              to="/received-orders"
              style={{ display: "flex", alignItems: "center" }}
            >
              <PageIcon /> Received Orders
            </NavLink>

            <NavLink
              to="/profile"
              style={{ display: "flex", alignItems: "center" }}
            >
              <PageIcon /> My Profile
            </NavLink>
          </>
        )}
        {isLoggedIn && (
          <NavLink
            to="/wishlist"
            style={{ display: "flex", alignItems: "center" }}
          >
            <HeartIcon /> Wishlist
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
