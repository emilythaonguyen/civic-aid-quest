import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import EmpathyMap from "./pages/EmpathyMap.tsx";
import JourneyMapStaff from "./pages/JourneyMapStaff.tsx";
import HCDArtefactsPage from "./pages/HCDArtifactsPage.tsx";
import PromptTemplatesPage from "./pages/PromptTemplatesPage.tsx";
import SprintBoardPage from "./pages/SprintBoardPage.tsx";
import CitizenEmpathyMap from "./pages/CitizenEmpathyMap.tsx";
import CitizenJourneyMap from "./pages/CitizenJourneyMap.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import CitizenPortalPage from "./pages/CitizenPortalPage.tsx";

import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage.tsx";
import StaffDashboardPage from "./pages/StaffDashboardPage.tsx";
import StaffDashboardListPage from "./pages/StaffDashboardListPage.tsx";
import StaffTicketDetailPage from "./pages/StaffTicketDetailPage.tsx";
import PublicStatusPage from "./pages/PublicStatusPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenPortalPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="staff">
                  <AnalyticsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/hcd/empathy-map-staff" element={<EmpathyMap />} />
            <Route path="/status" element={<PublicStatusPage />} />
            <Route path="/hcd/journey-map-staff" element={<JourneyMapStaff />} />
            <Route path="/hcd/artifacts" element={<HCDArtefactsPage />} />
            <Route path="/hcd/prompt-templates" element={<PromptTemplatesPage />} />
            <Route path="/hcd/sprint-board" element={<SprintBoardPage />} />
            <Route path="/hcd/citizen-empathy-map" element={<CitizenEmpathyMap />} />
            <Route path="/hcd/citizen-journey-map" element={<CitizenJourneyMap />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
