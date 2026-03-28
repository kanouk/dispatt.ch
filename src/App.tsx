import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import AuthCallback from "./pages/AuthCallback";
import Admin from "./pages/Admin";
import Services from "./pages/Services";
import Platforms from "./pages/Platforms";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Forbidden from "./pages/Forbidden";
import Health from "./pages/Health";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/health" element={<Health />} />

          {/** Public redirect bridge (no auth) */}
          <Route path="/:service/ep/:epNo" element={<React.Suspense fallback={<div />}>{React.createElement(React.lazy(() => import('./pages/Redirect')))}</React.Suspense>} />
          <Route path="/:service/ep/:epNo/:variant" element={<React.Suspense fallback={<div />}>{React.createElement(React.lazy(() => import('./pages/Redirect')))}</React.Suspense>} />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/platforms" 
            element={
              <ProtectedRoute>
                <Platforms />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
