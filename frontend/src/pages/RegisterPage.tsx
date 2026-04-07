import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <section className="authShell">
      <div className="authCard">
        <p className="eyebrow">New staff account</p>
        <h1>Register a user</h1>
        <p className="lede">
          This form creates a staff account for the internal dashboards. It should be limited to
          approved users in production.
        </p>

        <form
          className="form"
          onSubmit={async (event) => {
            event.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await register(firstName, email, username, password)
              navigate('/welcome')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Registration failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="field">
            <span>First name</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <div className="ctaRow">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <Link className="button buttonGhost" to="/login">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}
