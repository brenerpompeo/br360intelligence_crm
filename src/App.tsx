import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import SetupChecklist from "./pages/SetupChecklist";
import Pipeline from "./pages/Pipeline";
import Upsells from "./pages/Upsells";
import Financeiro from "./pages/Financeiro";
import Roadmap from "./pages/Roadmap";
import Auth from "./pages/Auth";
import CRM from "./pages/CRM";
import PlanoContas from "./pages/PlanoContas";
import Propostas from "./pages/Propostas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/setup" element={<ProtectedRoute><SetupChecklist /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
            <Route path="/upsells" element={<ProtectedRoute><Upsells /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/plano-contas" element={<ProtectedRoute><PlanoContas /></ProtectedRoute>} />
            <Route path="/propostas" element={<ProtectedRoute><Propostas /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
