import { Link } from 'react-router-dom'
import { useAuth } from '../state/auth'

export function HomePage() {
  const { user } = useAuth()

  return (
    <section className="card">
      <h1 className="title">Welcome to INTEX</h1>
      <p className="muted">
        This is the default home page everyone sees when first visiting the site.
      </p>

      <div className="row">
        {user ? (
          <Link className="button" to="/donor">
            Go to your dashboard
          </Link>
        ) : (
          <>
            <Link className="button" to="/login">
              Login
            </Link>
            <Link className="button secondary" to="/register">
              Create an account
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

