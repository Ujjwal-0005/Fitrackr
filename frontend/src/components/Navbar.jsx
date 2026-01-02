import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();

  // Get current user to check role and fetch avatar
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8080/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCurrentUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
      }
    };

    fetchUserProfile();
  }, []);

  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      // Open animation - slide from left with overshoot
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.fromTo(menuRef.current,
        { x: "-100%" },
        {
          x: 0,
          duration: 0.6,
          ease: "back.out(1.2)"
        }
      );
      document.body.style.overflow = "hidden";
    } else {
      // Close animation - slide to left
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
      gsap.to(menuRef.current, {
        x: "-100%",
        duration: 0.4,
        ease: "power3.in"
      });
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const menuItems = [
    { path: "/home", label: "Home", icon: "home" },
    { path: "/dashboard", label: "Dashboard", icon: "chart" },
    { path: "/smart-goal", label: "Smart Goals", icon: "target" },
    { path: "/workout-plans", label: "Workout Plans", icon: "clipboard" },
    { path: "/custom-sessions", label: "Custom Sessions", icon: "custom" },
    { path: "/exercises", label: "Exercises", icon: "dumbbell" },
    { path: "/personal-records", label: "Personal Records", icon: "trophy" },
    { path: "/nutrition", label: "Nutrition", icon: "apple" },
    { path: "/meal-planner", label: "Meal Planner", icon: "utensils" },
    { path: "/ai-planner", label: "AI Planner", icon: "robot" },
    { path: "/achievements", label: "Achievements", icon: "star" },
    { path: "/profile", label: "Profile", icon: "user" }
  ];

  // Icon component mapper
  const getIcon = (iconName) => {
    const icons = {
      home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      target: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>,
      clipboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      custom: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
      dumbbell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 8.5h2v7h-2zM17.5 8.5h2v7h-2zM8.5 10.5h7M8.5 13.5h7M6.5 6.5v11M17.5 6.5v11" /></svg>,
      trophy: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v5m-3 0h6M5 9h14M5 9a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 9l1.5 9h11L19 9" /></svg>,
      apple: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>,
      utensils: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 2v7c0 1.1.9 2 2 2h2v11h2V11h2c1.1 0 2-.9 2-2V2H3zm16 0v6h-2V2h-2v6h-2v2c0 1.66 1.34 3 3 3v9h2v-9c1.66 0 3-1.34 3-3V2h-2z" /></svg>,
      star: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
      user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    };
    return icons[iconName] || icons.home;
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* ELITE FITNESS NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'h-20 bg-[#0f1115]/95 backdrop-blur-2xl shadow-lg shadow-[#FE9A00]/5 border-b border-[#FE9A00]/10'
          : 'h-24 bg-transparent backdrop-blur-none'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo - Elite Design */}
          <Link to="/home" onClick={closeMenu} className="flex items-center group">
            <div className={`rounded-xl overflow-hidden flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 ${scrolled ? 'w-32 h-32' : 'w-40 h-40'}`}>
              <img
                src="/photo_2025-12-17_22-41-59.png"
                alt="GymTrackr Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Hamburger Button - Hidden for admins */}
          {currentUser?.role !== 'admin' && (
            <button
              onClick={toggleMenu}
              className="relative w-10 h-10 rounded-lg bg-[#1a1d23]/50 hover:bg-[#FE9A00]/20 hover:shadow-lg hover:shadow-[#FE9A00]/20 transition-all duration-300 flex items-center justify-center group"
              aria-label="Toggle command panel"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <motion.span
                  className="block h-0.5 w-full bg-[#FE9A00] rounded-full"
                  animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="block h-0.5 w-full bg-[#FE9A00] rounded-full"
                  animate={menuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-full bg-[#FE9A00] rounded-full"
                  animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          )}

          {/* Logout Button - Shows for admins */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all duration-300 font-medium text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Backdrop Overlay */}
      <div
        ref={overlayRef}
        onClick={closeMenu}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 opacity-0 pointer-events-none"
        style={{ display: menuOpen ? 'block' : 'none' }}
      />

      {/* TRAINING COMMAND PANEL (Left-Anchored) */}
      <div
        ref={menuRef}
        className="fixed top-0 left-0 h-screen w-full sm:w-[360px] bg-gradient-to-br from-[#1f242c]/98 via-[#0f1115]/98 to-[#1a1f27]/98 backdrop-blur-3xl border-r border-[#FE9A00]/10 shadow-2xl shadow-[#FE9A00]/10 z-50"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          transform: "translateX(-100%)"
        }}
      >
        <div className="h-full flex flex-col overflow-hidden">

          {/* USER IDENTITY SECTION - Clickable Profile Header */}
          <Link
            to="/profile"
            onClick={closeMenu}
            className="px-6 pt-8 pb-6 border-b border-[#FE9A00]/10 hover:bg-[#1a1d23]/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {/* Profile Photo / Avatar */}
              <div className="relative">
                {currentUser?.avatar?.url ? (
                  <img
                    src={currentUser.avatar.url}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#FE9A00]/40 group-hover:border-[#FE9A00] transition-all"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FE9A00] to-[#FFA500] flex items-center justify-center border-2 border-[#FE9A00]/40 group-hover:border-[#FE9A00] transition-all">
                    <span className="text-2xl font-black text-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {getUserInitials(currentUser?.name)}
                    </span>
                  </div>
                )}
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f1115]"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-[#FE9A00] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {currentUser?.name || "User"}
                </h3>
                <p className="text-sm text-[#6b7280] group-hover:text-[#FE9A00]/70 transition-colors">
                  View Profile →
                </p>
              </div>
            </div>
          </Link>

          {/* NAVIGATION ITEMS */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {menuOpen && (
                <motion.ul className="space-y-1">
                  {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Link
                          to={item.path}
                          onClick={closeMenu}
                          className="block group"
                        >
                          <motion.div
                            whileHover={{ x: 6 }}
                            className={`
                              w-full flex items-center justify-between px-5 py-4 rounded-xl
                              transition-all duration-300 relative overflow-hidden
                              ${isActive
                                ? 'bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black shadow-lg shadow-[#FE9A00]/30'
                                : 'text-[#a8adb3] hover:bg-[#1a1d23]/40 hover:text-white'
                              }
                            `}
                          >
                            {/* Active Glow Effect */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FE9A00] opacity-0"
                                animate={{ opacity: [0, 0.3, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}

                            <span className="flex items-center gap-3 relative z-10">
                              <span className={`${isActive ? 'text-black' : 'text-[#FE9A00]'}`}>
                                {getIcon(item.icon)}
                              </span>
                              <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                              </span>
                            </span>

                            <motion.span
                              className="relative z-10 text-lg"
                              initial={{ x: -5, opacity: 0 }}
                              whileHover={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              →
                            </motion.span>
                          </motion.div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </nav>

          {/* LOGOUT BUTTON - Bottom of Menu */}
          <div className="mt-auto px-4 pb-6 border-t border-[#FE9A00]/10 pt-4">
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 transition-all duration-300"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm font-bold text-red-400">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
