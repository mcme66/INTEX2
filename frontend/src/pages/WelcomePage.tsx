import { Link } from 'react-router-dom'
import { useAuth } from '../state/auth'

export function WelcomePage() {
  const { user } = useAuth()

  return (
    <section className="authShell">
      <div className="authCard">
        <p className="eyebrow">Authenticated</p>
        <h1>Welcome{user ? `, ${user.firstName}` : ''}</h1>
        <p className="lede">
          Your account is active. Use the internal dashboards to review operations, donor records,
          and donor-facing reporting.
        </p>
        <div className="ctaRow">
          <Link className="button" to="/admin">
            Open admin dashboard
          </Link>
          <Link className="button buttonGhost" to="/donors">
            Open supporter records
          </Link>
        </div>
      </div>
    </section>
  )
}
