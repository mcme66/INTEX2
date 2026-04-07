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
    <section className="card">
      <h1 className="title">Register</h1>
      <p className="muted">Create an account with email, username, and password.</p>

      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          try {
            await register(firstName, email, username, password)
            navigate('/donor')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
          } finally {
            setLoading(false)
          }
        }}
      >
        <label className="field">
          <span>First name</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <div className="row">
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
          <Link className="button secondary" to="/login">
            Back to login
          </Link>
        </div>
      </form>
    </section>
  )
}

