import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import EmpathyMap from "./pages/EmpathyMap.tsx";
import JourneyMapStaff from "./pages/JourneyMapStaff.tsx";
import HCDArtefactsPage from "./pages/HCDArtifactsPage.tsx";
import PromptTemplatesPage from "./pages/PromptTemplatesPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hcd/empathy-map" element={<EmpathyMap />} />
          <Route path="/hcd/journey-map-staff" element={<JourneyMapStaff />} />
          <Route path="/hcd/artifacts" element={<HCDArtefactsPage />} />
          <Route path="/hcd/prompt-templates" element={<PromptTemplatesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
