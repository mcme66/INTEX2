import { Navigate, Route, Routes } from 'react-router-dom'
import { CookieConsent } from './components/CookieConsent'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { DonorsPage } from './pages/DonorsPage'
import { HomePage } from './pages/HomePage'
import { ImpactPage } from './pages/ImpactPage'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { RegisterPage } from './pages/RegisterPage'
import { WelcomePage } from './pages/WelcomePage'
import { useAuth } from './state/auth'

function App() {
  const { user } = useAuth()

  return (
    <div className="siteShell">
      <Header />
      <main className="siteMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={user ? <Navigate to="/welcome" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/welcome" /> : <RegisterPage />} />
          <Route path="/welcome" element={user ? <WelcomePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}

export default App
