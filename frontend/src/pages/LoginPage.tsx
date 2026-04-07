import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <section className="card">
      <h1 className="title">Login</h1>
      <p className="muted">Enter your username and password.</p>

      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          try {
            await login(username, password)
            navigate('/donor')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
          } finally {
            setLoading(false)
          }
        }}
      >
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
            required
          />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <div className="row">
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <Link className="button secondary" to="/register">
            Register here
          </Link>
        </div>
      </form>
    </section>
  )
}

