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
import DonorDashboard from "./pages/DonorDashboard.tsx";
import AdminUtilityPage from "./pages/AdminUtilityPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./state/auth";

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
        element={
          <ProtectedRoute
            role="admin"
            element={
              <AdminUtilityPage
                eyebrow="Caseload Inventory"
                title="Caseload inventory"
                description="This route from the previous frontend is now hosted inside the lovable app and ready for future caseload tooling."
              />
            }
          />
        }
      />
      <Route
        path="/admin/process-recording"
        element={
          <ProtectedRoute
            role="admin"
            element={
              <AdminUtilityPage
                eyebrow="Process Recording"
                title="Process recording"
                description="This preserved admin route can now be implemented incrementally without abandoning the new frontend design."
              />
            }
          />
        }
      />
      <Route
        path="/admin/visits"
        element={
          <ProtectedRoute
            role="admin"
            element={
              <AdminUtilityPage
                eyebrow="Home Visitation"
                title="Home visitation and case conferences"
                description="The old operational route now exists in the lovable frontend shell with admin protection intact."
              />
            }
          />
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute
            role="admin"
            element={
              <AdminUtilityPage
                eyebrow="Reports & Analytics"
                title="Reports and analytics"
                description="This route is preserved and protected so analytics functionality can be added without revisiting the app shell again."
              />
            }
          />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
