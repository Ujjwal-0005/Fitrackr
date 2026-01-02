import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import SavedPlans from "./pages/SavedPlans";
import AIPlanner from "./pages/aiPlanner";
import LandingPage from "./pages/LandingPage";
// import WorkoutSession from "./pages/WorkoutSession";
import WorkoutSessionNew from "./pages/WorkoutSessionNew";
import WorkoutPlans from "./pages/WorkoutPlans";
import Profile from "./pages/Profile";
import PersonalRecords from "./pages/PersonalRecords";
import Achievements from "./pages/Achievements";
import Nutrition from "./pages/Nutrition";
import GoalSetup from "./pages/GoalSetup";
import SmartGoalDashboard from "./pages/SmartGoalDashboard";
import SmartWorkoutSession from "./pages/SmartWorkoutSession";
import CustomSessionBuilder from "./pages/CustomSessionBuilder";
import CustomSessions from "./pages/CustomSessions";
import MealPlanner from "./pages/MealPlanner";
import SessionDebug from "./pages/SessionDebug";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Exercises from "./pages/Exercises";
import Preloader from "./components/Preloader";
import { PreloaderProvider, usePreloader } from "./context/PreloaderContext";

// ✅ Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const { isLoading } = usePreloader();

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* ---------- Protected User Routes ---------- */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-session"
            element={
              <ProtectedRoute>
                <WorkoutSessionNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-session-new"
            element={
              <ProtectedRoute>
                <WorkoutSessionNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-plans"
            element={
              <ProtectedRoute>
                <WorkoutPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-plans/custom"
            element={
              <ProtectedRoute>
                <CustomSessionBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-sessions"
            element={
              <ProtectedRoute>
                <CustomSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-planner"
            element={
              <ProtectedRoute>
                <AIPlanner />

              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-plans"
            element={
              <ProtectedRoute>
                <SavedPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-records"
            element={
              <ProtectedRoute>
                <PersonalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <Exercises />
              </ProtectedRoute>
            }
          />


          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nutrition"
            element={
              <ProtectedRoute>
                <Nutrition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session-debug"
            element={
              <ProtectedRoute>
                <SessionDebug />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goal-setup"
            element={
              <ProtectedRoute>
                <GoalSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-goal"
            element={
              <ProtectedRoute>
                <SmartGoalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-session/:planId/:sessionIndex"
            element={
              <ProtectedRoute>
                <SmartWorkoutSession />
              </ProtectedRoute>
            }
          />

          {/* ---------- Admin Routes ---------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

      </BrowserRouter>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreloaderProvider>
          <AppContent />
        </PreloaderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
