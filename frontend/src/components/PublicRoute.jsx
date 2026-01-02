import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PublicRoute - Redirects authenticated users away from auth pages
 * Used for login, register, and other public-only pages
 */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Wait for authentication check to finish
    if (loading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    // If user is logged in, redirect based on role
    if (user) {
        // Redirect admins to admin dashboard, regular users to home
        const redirectPath = user.role === "admin" ? "/admin" : "/home";
        return <Navigate to={redirectPath} replace />;
    }

    // Otherwise, render the public page
    return children;
};

export default PublicRoute;
