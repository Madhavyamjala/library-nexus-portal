
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Books from "@/pages/Books";
import Members from "@/pages/Members";
import Borrowing from "@/pages/Borrowing";
import MyBooks from "@/pages/MyBooks";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/books" element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute roles={["librarian"]}>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="/borrowing" element={
              <ProtectedRoute roles={["librarian"]}>
                <Borrowing />
              </ProtectedRoute>
            } />
            <Route path="/my-books" element={
              <ProtectedRoute roles={["member"]}>
                <MyBooks />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
