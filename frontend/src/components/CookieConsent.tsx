import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'northstar.cookie-consent'

type CookieChoice = 'accepted' | 'declined'

export function CookieConsent() {
  const [choice, setChoice] = useState<CookieChoice | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY)
    if (saved === 'accepted' || saved === 'declined') {
      setChoice(saved)
    }
  }, [])

  if (choice) return null

  const saveChoice = (nextChoice: CookieChoice) => {
    localStorage.setItem(COOKIE_KEY, nextChoice)
    setChoice(nextChoice)
  }

  return (
    <aside className="cookieBanner" aria-live="polite" aria-label="Cookie preferences">
      <div>
        <p className="eyebrow">Cookie notice</p>
        <p className="cookieText">
          North Star uses essential cookies for site function and offers optional analytics cookies
          to improve donor reporting. You can accept or decline non-essential cookies.
        </p>
      </div>
      <div className="cookieActions">
        <Link to="/privacy" className="actionLink">
          Read policy
        </Link>
        <button className="button buttonGhost" onClick={() => saveChoice('declined')}>
          Decline
        </button>
        <button className="button" onClick={() => saveChoice('accepted')}>
          Accept
        </button>
      </div>
    </aside>
  )
}
