import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

function Pipe() {
  return <span className="navPipe">|</span>
}

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="headerInner">
        <Link to="/" className="brand">
          Home
        </Link>
        <nav className="navLinks" aria-label="Primary navigation">
          {user ? (
            <>
              <Link to="/donor" className="link">
                Donor Dashboard
              </Link>
              <Link to="/admin/donors" className="link">
                Donor Information
              </Link>
              <Pipe />
              <Link to="/admin" className="link">
                Admin Dashboard
              </Link>
              <Link to="/admin/caseload" className="link">
                Caseloads
              </Link>
              <Link to="/admin/process-recording" className="link">
                Process Recording
              </Link>
              <Link to="/admin/home-visitation" className="link">
                Visits
              </Link>
              <Link to="/admin/reports" className="link">
                Reports
              </Link>
              <Pipe />
            </>
          ) : null}
          <Link to="/impact" className="link">
            Impact
          </Link>
          <Link to="/privacy" className="link">
            Privacy
          </Link>
          <Link to="/about" className="link">
            About Us
          </Link>
        </nav>
        <div className="navAuth">
          {user ? (
            <button
              className="button secondary"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="button">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

