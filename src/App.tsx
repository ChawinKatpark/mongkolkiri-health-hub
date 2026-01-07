import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import PatientRegister from "./pages/PatientRegister";
import Patients from "./pages/Patients";
import Queue from "./pages/Queue";
import NotFound from "./pages/NotFound";
import PatientLinkPage from "./pages/PatientLinkPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientVisitHistory from "./pages/patient/PatientVisitHistory";
import PatientVisitDetail from "./pages/patient/PatientVisitDetail";
import PatientMedicationHistory from "./pages/patient/PatientMedicationHistory";
import VisitConsultation from "./pages/VisitConsultation";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PatientProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  
  if (loading || accountLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary font-display">กำลังโหลด...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
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
      
      {/* Staff routes */}
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
      <Route path="/consultation/:visitId" element={<ProtectedRoute><VisitConsultation /></ProtectedRoute>} />
      
      {/* Patient routes */}
      <Route path="/patient" element={<PatientProtectedRoute><PatientDashboard /></PatientProtectedRoute>} />
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
