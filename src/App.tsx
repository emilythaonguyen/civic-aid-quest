import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import StaffLoginPage from "./pages/StaffLoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import PublicStatusPage from "./pages/PublicStatusPage.tsx";
import SurveyPage from "./pages/SurveyPage.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy-load internal/protected pages so their content (including persona data)
// is code-split and never served on public-facing routes.
const EmpathyMap = lazy(() => import("./pages/EmpathyMap.tsx"));
const JourneyMapStaff = lazy(() => import("./pages/JourneyMapStaff.tsx"));
const HCDArtefactsPage = lazy(() => import("./pages/HCDArtifactsPage.tsx"));
const PromptTemplatesPage = lazy(() => import("./pages/PromptTemplatesPage.tsx"));
const SprintBoardPage = lazy(() => import("./pages/SprintBoardPage.tsx"));
const CitizenEmpathyMap = lazy(() => import("./pages/CitizenEmpathyMap.tsx"));
const CitizenJourneyMap = lazy(() => import("./pages/CitizenJourneyMap.tsx"));
const CitizenPortalPage = lazy(() => import("./pages/CitizenPortalPage.tsx"));
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboardPage.tsx"));
const StaffDashboardPage = lazy(() => import("./pages/StaffDashboardPage.tsx"));
const StaffDashboardListPage = lazy(() => import("./pages/StaffDashboardListPage.tsx"));
const StaffTicketDetailPage = lazy(() => import("./pages/StaffTicketDetailPage.tsx"));
const StaffWorkloadPage = lazy(() => import("./pages/StaffWorkloadPage.tsx"));
const StaffTicketQueuePage = lazy(() => import("./pages/StaffTicketQueuePage.tsx"));
const SurveyResultsPage = lazy(() => import("./pages/SurveyResultsPage.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/citizen-login" element={<LoginPage />} />
            <Route path="/staff-login" element={<StaffLoginPage />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenPortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboardListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/ticket/:id"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffTicketDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/workload"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffWorkloadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/tickets/:staffId"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffTicketQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredRole="staff">
                  <AnalyticsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/hcd/empathy-map-staff" element={<EmpathyMap />} />
            <Route path="/status" element={<PublicStatusPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route
              path="/survey-results"
              element={
                <ProtectedRoute requiredRole="staff">
                  <SurveyResultsPage />
                </ProtectedRoute>
              }
            />
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
