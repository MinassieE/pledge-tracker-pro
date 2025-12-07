import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminsList from "./pages/admins/AdminsList";
import FollowUpsList from "./pages/followUps/FollowUpsList";
import PledgesList from "./pages/pledges/PledgesList";
import CreatePledge from "./pages/pledges/CreatePledge";
import PledgeDetails from "./pages/pledges/PledgeDetails";
import OverduePledges from "./pages/pledges/OverduePledges";
import CollectionStats from "./pages/reports/CollectionStats";
import FollowUpPerformance from "./pages/reports/FollowUpPerformance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Admin management - SuperAdmin only */}
              <Route
                path="/admins"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <AdminsList />
                  </ProtectedRoute>
                }
              />

              {/* Follow-up management - SuperAdmin and Admin */}
              <Route
                path="/follow-ups"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <FollowUpsList />
                  </ProtectedRoute>
                }
              />

              {/* Pledge routes */}
              <Route
                path="/pledges"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <PledgesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledges/create"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <CreatePledge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledges/:id"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin', 'followUp']}>
                    <PledgeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledges/overdue"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin', 'followUp']}>
                    <OverduePledges />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledges/due-monthly"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin', 'followUp']}>
                    <PledgesList />
                  </ProtectedRoute>
                }
              />

              {/* Follow-up user's own pledges */}
              <Route
                path="/my-pledges"
                element={
                  <ProtectedRoute allowedRoles={['followUp']}>
                    <PledgesList />
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports/collection"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <CollectionStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/monthly"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <CollectionStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/performance"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <FollowUpPerformance />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
