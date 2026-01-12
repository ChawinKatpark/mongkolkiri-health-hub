import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import PatientRegister from "./pages/PatientRegister";
import Patients from "./pages/Patients";
import Queue from "./pages/Queue";
import NotFound from "./pages/NotFound";
import NoPermission from "./pages/NoPermission";
import PatientLinkPage from "./pages/PatientLinkPage";
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientVisitHistory from "./pages/patient/PatientVisitHistory";
import PatientVisitDetail from "./pages/patient/PatientVisitDetail";
import PatientMedicationHistory from "./pages/patient/PatientMedicationHistory";
import VisitConsultation from "./pages/VisitConsultation";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

// Staff-only route protection
const StaffProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isPatient, isStaff, isLoading: roleLoading } = useUserRole();
  
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect patients to patient dashboard
  if (isPatient && !isStaff) {
    return <Navigate to="/patient" replace />;
  }

  // Non-staff, non-patient users cannot access staff pages
  if (!isStaff && !isPatient) {
    return <Navigate to="/no-permission" replace />;
  }
  
  return <>{children}</>;
};

// Admin-only route protection
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/no-permission" replace />;
  }
  
  return <>{children}</>;
};

// Patient-only route protection
const PatientProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const { isStaff, isLoading: roleLoading } = useUserRole();
  
  if (loading || accountLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Staff members without patient accounts go to staff dashboard
  if (isStaff && !patientAccount) {
    return <Navigate to="/" replace />;
  }

  if (!patientAccount) {
    return <Navigate to="/patient-link" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/patient-register" element={<PatientRegister />} />
      <Route path="/patient-link" element={<PatientLinkPage />} />
      <Route path="/patient-signup" element={<PatientSignup />} />
      <Route path="/no-permission" element={<NoPermission />} />
      
      {/* Admin routes */}
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
      
      {/* Staff routes */}
      <Route path="/" element={<StaffProtectedRoute><Index /></StaffProtectedRoute>} />
      <Route path="/register" element={<StaffProtectedRoute><Register /></StaffProtectedRoute>} />
      <Route path="/patients" element={<StaffProtectedRoute><Patients /></StaffProtectedRoute>} />
      <Route path="/queue" element={<StaffProtectedRoute><Queue /></StaffProtectedRoute>} />
      <Route path="/consultation/:visitId" element={<StaffProtectedRoute><VisitConsultation /></StaffProtectedRoute>} />
      
      {/* Patient routes */}
      <Route path="/patient" element={<PatientProtectedRoute><PatientDashboard /></PatientProtectedRoute>} />
      <Route path="/patient/profile" element={<PatientProtectedRoute><PatientProfile /></PatientProtectedRoute>} />
      <Route path="/patient/visits" element={<PatientProtectedRoute><PatientVisitHistory /></PatientProtectedRoute>} />
      <Route path="/patient/visits/:id" element={<PatientProtectedRoute><PatientVisitDetail /></PatientProtectedRoute>} />
      <Route path="/patient/medications" element={<PatientProtectedRoute><PatientMedicationHistory /></PatientProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
