import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Donors from "./pages/Donors.tsx";
import Impact from "./pages/Impact.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Volunteer from "./pages/Volunteer.tsx";
import Privacy from "./pages/Privacy.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ReportPage from "./pages/ReportTemp.tsx";
import DonorDashboard from "./pages/DonorDashboard.tsx";
import Caseload from "./pages/Caseload.tsx";
import ProcessRecordingPage from "./pages/ProcessRecording.tsx";
import HomeVisitationPage from "./pages/HomeVisitation.tsx";
import Staff from "./pages/Staff.tsx";
import Settings from "./pages/Settings.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import { AuthProvider, useAuth } from "./state/auth";
import { MlRefreshProvider } from "./state/mlRefresh";
import { LanguageProvider } from "./state/language";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        const id = decodeURIComponent(hash.slice(1));
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="/login" element={user ? <Navigate to="/impact" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/impact" replace /> : <Register />} />
        <Route
          path="/donor"
          element={<ProtectedRoute role="donor" element={<DonorDashboard />} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute role="admin" element={<AdminDashboard />} />}
        />
        <Route
          path="/admin/caseloads"
          element={<ProtectedRoute role="admin" element={<Caseload />} />}
        />
        <Route
          path="/admin/process-recording"
          element={<ProtectedRoute role="admin" element={<ProcessRecordingPage />} />}
        />
        <Route
          path="/admin/visits"
          element={<ProtectedRoute role="admin" element={<HomeVisitationPage />} />}
        />
        <Route
          path="/admin/reports"
          element={<ProtectedRoute role="admin" element={<ReportPage />} />}
        />
        <Route
          path="/admin/donor"
          element={<ProtectedRoute role="admin" element={<Donors />} />}
        />
        <Route
          path="/admin/donors"
          element={<ProtectedRoute role="admin" element={<Donors />} />}
        />
        <Route
          path="/admin/staff"
          element={<ProtectedRoute role="admin" element={<Staff />} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <MlRefreshProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* GDPR cookie consent banner — shown on first visit, stores choice in localStorage */}
            <CookieConsent />
            <AppRoutes />
          </TooltipProvider>
        </MlRefreshProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
