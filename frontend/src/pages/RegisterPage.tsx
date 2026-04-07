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
  const [isDonor, setIsDonor] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
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
              if (!isAdmin && !isDonor) throw new Error('Select at least one role (Donor and/or Admin).')
              if (isAdmin && adminCode.trim().length === 0)
                throw new Error('Admin code is required to register as an admin.')
              const user = await register(firstName, email, username, password, isDonor, isAdmin, adminCode)
              navigate(user.isAdmin ? '/admin' : user.isDonor ? '/donor' : '/')
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

          <fieldset className="field">
            <legend>Role(s)</legend>
            <label className="checkRow">
              Donor:
              <input type="checkbox" checked={isDonor} onChange={(event) => setIsDonor(event.target.checked)} />
            </label>
            <label className="checkRow">
              Admin:
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(event) => {
                  const next = event.target.checked
                  setIsAdmin(next)
                  if (!next) setAdminCode('')
                }}
              />
            </label>
            {isAdmin ? (
              <label className="field">
                <span>Admin code</span>
                <input value={adminCode} onChange={(event) => setAdminCode(event.target.value)} required />
              </label>
            ) : null}
          </fieldset>

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
