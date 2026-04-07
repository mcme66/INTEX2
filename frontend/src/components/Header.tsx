import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/donors', label: 'Donors & Contributions' },
  { to: '/impact', label: 'Impact' },
  { to: '/admin', label: 'Admin' },
]

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="siteHeader">
      <div className="headerWrap">
        <NavLink to="/" className="brandMark" aria-label="North Star home">
          <img src="/kid_stars.svg" alt="" className="brandIcon" />
          <div>
            <strong>North Star</strong>
            <span>Refuge, restoration, and long-term care</span>
          </div>
        </NavLink>

        <nav className="primaryNav" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navLink${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="headerActions">
          {user ? (
            <>
              <NavLink to="/welcome" className="actionLink">
                {user.firstName}
              </NavLink>
              <button
                className="button buttonGhost"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="actionLink">
                Staff Login
              </NavLink>
              <NavLink to="/impact" className="button">
                See the work
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
