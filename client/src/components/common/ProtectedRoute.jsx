// File: client/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "./Layout.jsx";

/**
 * Wraps all authenticated routes.
 * - Shows spinner while auth state loads
 * - Redirects to /login if not authenticated
 * - Renders Layout + nested route content if authenticated
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
          <p className="text-ink/40 text-sm font-medium">Loading TravelBuddy…</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
}
