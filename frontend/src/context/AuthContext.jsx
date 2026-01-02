import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutAPI } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from cookie-based session
    getMe()
      .then((res) => {
        if (res.data && res.data._id) {
          setUser(res.data);
        } else {
          console.warn('Invalid user data received from getMe:', res.data);
          setUser(null);
        }
      })
      .catch((error) => {
        // Any error means user is not logged in
        console.log('getMe error - user not authenticated:', error.response?.status);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await logoutAPI();
      setUser(null);
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and localStorage
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
