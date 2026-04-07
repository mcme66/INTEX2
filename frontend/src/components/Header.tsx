import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

type NavItem = { to: string; label: string }

const authGroup1: NavItem[] = [
  { to: '/donor', label: 'Donor Dashboard' },
]

const authGroup2: NavItem[] = [
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/donors', label: 'Donor Information' },
  { to: '/admin/caseloads', label: 'Caseloads' },
  { to: '/admin/process-recording', label: 'Process Recording' },
  { to: '/admin/visits', label: 'Visits' },
  { to: '/admin/reports', label: 'Reports' },
]

const publicGroup: NavItem[] = [
  { to: '/impact', label: 'Impact' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/volunteer', label: 'Volunteer With Us' },
]

function Pipe() {
  return <span className="navPipe">|</span>
}

function HeaderNavLink({ to, label }: NavItem) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `navLink${isActive ? ' active' : ''}`}
    >
      {label}
    </NavLink>
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="siteHeader">
      <div className="headerWrap">
        <NavLink to="/" className="brandMark" aria-label="North Star home">
          <img src="/kid_stars.svg" alt="" className="brandIcon" />
          <strong>North Star</strong>
        </NavLink>

        <div className="headerRight">
          <nav className="primaryNav" aria-label="Primary">
            {user ? (
              <>
                {user.isDonor ? (
                  <>
                    {authGroup1.map((item) => (
                      <HeaderNavLink key={`a1-${item.to}`} {...item} />
                    ))}
                    <Pipe />
                  </>
                ) : null}
                {user.isAdmin ? (
                  <>
                    {authGroup2.map((item) => (
                      <HeaderNavLink key={`a2-${item.to}`} {...item} />
                    ))}
                    <Pipe />
                  </>
                ) : null}
              </>
            ) : null}

            {publicGroup.map((item) => (
              <HeaderNavLink key={`p-${item.to}`} {...item} />
            ))}
          </nav>

          <div className="headerActions">
            {user ? (
              <button
                className="button buttonGhost"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Log Out
              </button>
            ) : (
              <NavLink to="/login" className="button">
                Log In
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
