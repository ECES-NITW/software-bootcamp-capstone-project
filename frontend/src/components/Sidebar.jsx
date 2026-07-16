import { NavLink } from 'react-router-dom'

//Left column of the layout. Just the structure for now - no colours, no buttons.
//NavLink is like Link but also tells you when its route is active.
function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebarNav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/example">Example</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
