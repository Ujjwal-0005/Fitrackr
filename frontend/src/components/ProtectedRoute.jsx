import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BackToHome from "./BackToHome";

/**
 * Protects routes based on user role.
 * - Admins can ONLY access /admin routes
 * - Regular users can ONLY access user routes (home, workouts, etc.)
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for authentication check to finish
  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If user is admin but trying to access non-admin routes
  if (user.role === "admin" && !isAdminRoute) {
    return <Navigate to="/admin" />;
  }

  // If user is regular user but trying to access admin routes
  if (user.role !== "admin" && isAdminRoute) {
    return <Navigate to="/home" />;
  }

  // Legacy adminOnly check (for backwards compatibility)
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/home" />;
  }

  // Don't show BackToHome button on the home page itself or landing page
  const shouldShowBackToHome = location.pathname !== '/home' && location.pathname !== '/';

  return (
    <>
      {shouldShowBackToHome && (
        <div className="fixed top-20 sm:top-24 left-3 sm:left-6 z-40">
          <BackToHome />
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
