import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CookieConsent } from './components/CookieConsent'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { CaseloadInventoryPage } from './pages/CaseloadInventoryPage'
import { DonorDashboardPage } from './pages/DonorDashboardPage'
import { HomePage } from './pages/HomePage'
import { HomeVisitationCaseConferencesPage } from './pages/HomeVisitationCaseConferencesPage'
import { ImpactPage } from './pages/ImpactPage'
import { LoginPage } from './pages/LoginPage'
import { DonorsPage } from './pages/DonorsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProcessRecordingPage } from './pages/ProcessRecordingPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage'
import { VolunteerPage } from './pages/VolunteerPage'
import { useAuth } from './state/auth'

function App() {
  const { user } = useAuth()
  const isDonor = !!user?.isDonor
  const isAdmin = !!user?.isAdmin

  function requireRole(allowed: 'donor' | 'admin', element: ReactElement) {
    if (!user) return <Navigate to="/login" />
    if (allowed === 'donor' && !isDonor) return <Navigate to="/" />
    if (allowed === 'admin' && !isAdmin) return <Navigate to="/" />
    return element
  }

  return (
    <div className="siteShell">
      <Header />
      <main className="siteMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donors" element={requireRole('admin', <DonorsPage />)} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/donor" element={requireRole('donor', <DonorDashboardPage />)} />
          <Route path="/admin" element={requireRole('admin', <AdminDashboardPage />)} />
          <Route path="/admin/caseloads" element={requireRole('admin', <CaseloadInventoryPage />)} />
          <Route
            path="/admin/process-recording"
            element={requireRole('admin', <ProcessRecordingPage />)}
          />
          <Route path="/admin/visits" element={requireRole('admin', <HomeVisitationCaseConferencesPage />)} />
          <Route path="/admin/reports" element={requireRole('admin', <ReportsAnalyticsPage />)} />
          <Route path="/login" element={user ? <Navigate to="/impact" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/impact" /> : <RegisterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}

export default App
