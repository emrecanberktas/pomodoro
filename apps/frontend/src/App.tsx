import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { NonAuthGuard } from "./components/NonAuthGuard";
import Dashboard from "./pages/Dashboard";
import Auth from "@/pages/Auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />

        {/* Auth Route */}
        <Route
          path="/auth"
          element={
            <NonAuthGuard>
              <Auth />
            </NonAuthGuard>
          }
        />

        {/* Redirect root to dashboard or auth based on auth status */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Redirect all other routes to auth */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
