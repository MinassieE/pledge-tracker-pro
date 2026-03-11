import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminsList from "./pages/admins/AdminsList";
import FollowUpsList from "./pages/followUps/FollowUpsList";
import ProjectManagement from "./pages/projects/ProjectManagement";
import UserAssignment from "./pages/projects/UserAssignment";
import PledgesList from "./pages/pledges/PledgesList";
import CreatePledge from "./pages/pledges/CreatePledge";
import EditPledge from "./pages/pledges/EditPledge";
import BulkImport from "./pages/pledges/BulkImport";
import PledgeDetails from "./pages/pledges/PledgeDetails";
import OverduePledges from "./pages/pledges/OverduePledges";
import CollectionStats from "./pages/reports/CollectionStats";
import FollowUpPerformance from "./pages/reports/FollowUpPerformance";
import CustomReports from "./pages/reports/CustomReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0, // Data is immediately stale
      cacheTime: 0, // Don't cache data
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
              
              {/* Change Password - All authenticated users */}
              <Route path="/change-password" element={<ChangePassword />} />
              
              {/* Admin management - SuperAdmin only */}
              <Route
                path="/admins"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <AdminsList />
                  </ProtectedRoute>
                }
              />

              {/* Project management - SuperAdmin only */}
              <Route
                path="/projects"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <ProjectManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId/assignments"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <UserAssignment />
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
                path="/pledges/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
                    <EditPledge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledges/bulk-import"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <BulkImport />
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
              <Route
                path="/reports/custom"
                element={
                  <ProtectedRoute allowedRoles={['superAdmin']}>
                    <CustomReports />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
