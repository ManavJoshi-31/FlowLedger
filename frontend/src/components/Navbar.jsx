import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="navbar-brand">FlowLedger</h1>

      <div className="navbar-links">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? 'navbar-link active' : 'navbar-link'
          }
        >
          Login
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'navbar-link active' : 'navbar-link'
          }
        >
          Dashboard
        </NavLink>
      </div>
    </nav>
  )
}

export default Navbar