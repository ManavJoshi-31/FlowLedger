import { NavLink } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext)

  return (
    <nav className="navbar">
      <h1 className="navbar-brand">FlowLedger</h1>

      <div className="navbar-links">
        {!isAuthenticated && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Login
          </NavLink>
        )}

        {isAuthenticated && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              Dashboard
            </NavLink>

            <button
              type="button"
              className="navbar-link"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar