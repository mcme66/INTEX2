import { Navigate, Route, Routes } from 'react-router-dom'
import { CookieConsent } from './components/CookieConsent'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AboutUsPage } from './pages/AboutUsPage'
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

  return (
    <div className="siteShell">
      <Header />
      <main className="siteMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/donor" element={user ? <DonorDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <AdminDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/admin/caseloads" element={user ? <CaseloadInventoryPage /> : <Navigate to="/login" />} />
          <Route
            path="/admin/process-recording"
            element={user ? <ProcessRecordingPage /> : <Navigate to="/login" />}
          />
          <Route path="/admin/visits" element={user ? <HomeVisitationCaseConferencesPage /> : <Navigate to="/login" />} />
          <Route path="/admin/reports" element={user ? <ReportsAnalyticsPage /> : <Navigate to="/login" />} />
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
