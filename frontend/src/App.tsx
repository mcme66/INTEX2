import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import MlReport from "./pages/Report.tsx";
import DonorDashboard from "./pages/DonorDashboard.tsx";
import AdminUtilityPage from "./pages/AdminUtilityPage.tsx";
import Caseload from "./pages/Caseload.tsx";
import ProcessRecordingPage from "./pages/ProcessRecording.tsx";
import HomeVisitationPage from "./pages/HomeVisitation.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./state/auth";
import { MlRefreshProvider } from "./state/mlRefresh";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/donors" element={<Donors />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/privacy" element={<Privacy />} />
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
        element={<ProtectedRoute role="admin" element={<MlReport />} />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <MlRefreshProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </MlRefreshProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
