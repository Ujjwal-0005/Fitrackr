import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { setUser } = useAuth();

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(0, 173, 181, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Calculate password strength
  useEffect(() => {
    if (!form.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (/[!@#$%^&*]/.test(form.password)) strength++;

    setPasswordStrength(strength);
  }, [form.password]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (value && !/^[A-Za-z\s]+$/.test(value)) {
          return "Name can only contain letters and spaces";
        }
        return "";
      case "email":
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          return "Invalid email format";
        }
        return "";
      case "password":
        if (value && value.length < 8) return "At least 8 characters required";
        if (value && !/[A-Z]/.test(value)) return "Include uppercase letter";
        if (value && !/[0-9]/.test(value)) return "Include number";
        if (value && !/[!@#$%^&*]/.test(value)) return "Include special character";
        return "";
      case "confirmPassword":
        if (value && value !== form.password) return "Passwords don't match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed';
    }
    if (file.size > maxSize) {
      return 'Image must be less than 5MB';
    }
    return null;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setPhotoError(error);
      setProfilePhoto(null);
      setPhotoPreview(null);
      return;
    }

    setPhotoError("");
    setProfilePhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: form.email,
        name: form.name,
        password: form.password,
      };

      // Note: Photo will be uploaded after successful registration
      // Do NOT send base64 image in OTP request (causes 413 Payload Too Large error)

      await apiClient.post("/auth/signup/send-otp", payload);
      toast.success("OTP sent to your email!");
      setStep(2);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: form.email,
        otp,
        name: form.name,
        password: form.password,
      };

      // Note: Photo will be uploaded after successful registration
      // Do NOT send base64 image in OTP verification request (causes 413 Payload Too Large error)

      const res = await apiClient.post("/auth/signup/verify-otp", payload);

      const { user } = res.data;

      // Token is now stored in HttpOnly cookie by backend
      // No need to store in localStorage
      setUser(user); // Update AuthContext

      toast.success("Account created successfully!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthLabel = ["Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-[#FE9A00]",
    "bg-green-500",
  ];

  const features = [
    { text: "AI-powered goal tracking" },
    { text: "Advanced progress analytics" },
    { text: "Achievement system" },
    { text: "Smart workout adaptation" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] flex overflow-hidden relative">
      {/* Particle Background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Ambient Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-[#FE9A00]/8 rounded-full blur-3xl"
          style={{ animation: "float 25s ease-in-out infinite", top: '10%', right: '5%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] bg-[#FE9A00]/12 rounded-full blur-3xl"
          style={{ animation: "float 30s ease-in-out infinite 5s", bottom: '10%', left: '10%' }}
        />
      </div>

      {/* Background Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Left Section - Features/Brand */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10"
      >
        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full">
          {/* Logo/Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src="/photo_2025-12-17_22-41-59.png" alt="GymTrackr Logo" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Middle Content */}
          <div className="space-y-10">
            <div>
              <h1 className="font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk', 'Sora', sans-serif", fontSize: "64px", letterSpacing: "-0.02em" }}>
                Start Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">Journey Today</span>
              </h1>
              <p className="text-[#a8adb3] max-w-md" style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 400 }}>
                Join thousands of athletes who train smarter with intelligent tracking and AI-driven insights.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="group flex items-center gap-4 p-4 rounded-[14px] border transition-all duration-200 ease-in-out cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out"
                    style={{
                      background: 'rgba(0, 173, 181, 0.15)',
                      boxShadow: '0 0 20px rgba(0, 173, 181, 0.3)'
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#FE9A00',
                        boxShadow: '0 0 8px rgba(0, 173, 181, 0.8), 0 0 12px rgba(0, 173, 181, 0.4)'
                      }}
                    />
                  </div>
                  <span
                    className="text-[#EEEEEE] transition-colors duration-200 ease-in-out group-hover:text-white"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500 }}
                  >
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="flex gap-2">
            <div className="h-1 w-16 bg-[#FE9A00] rounded-full" />
            <div className="h-1 w-8 bg-[#FE9A00]/50 rounded-full" />
            <div className="h-1 w-4 bg-[#FE9A00]/25 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto z-10">
        {/* Mobile logo */}
        <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <img src="/photo_2025-12-17_22-41-59.png" alt="GymTrackr Logo" className="h-10 w-auto" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-xl my-20 lg:my-0 relative"
        >
          {/* Animated Border Container */}
          <div className="relative p-[2px] rounded-2xl overflow-hidden">
            {/* Animated Gradient Border */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'conic-gradient(from 0deg, #FE9A00, #FFA500, #FE9A00, #0f1115, #FE9A00)',
                animation: 'rotate 8s linear infinite'
              }}
            />

            {/* Form Content */}
            <div className="relative bg-[#0f1115] rounded-2xl p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-semibold text-white mb-3" style={{ fontFamily: "'Space Grotesk', 'Sora', sans-serif", fontSize: "36px", letterSpacing: "-0.03em" }}>
                  {step === 1 ? "Create Account" : "Verify Email"}
                </h1>
                <p className="text-[#a8adb3]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 400 }}>
                  {step === 1 ? "Start tracking your fitness journey" : "Enter the code sent to your email"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendOTP}
                    className="space-y-5"
                  >
                    {/* Profile Photo Upload - Centered at Top */}
                    <div className="flex flex-col items-center mb-6">
                      <label className="cursor-pointer group relative">
                        {/* Preview Circle */}
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-200 ease-in-out group-hover:border-[#FE9A00]"
                          style={{
                            background: photoPreview ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
                            borderColor: photoError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {photoPreview ? (
                            <>
                              <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <span className="text-white text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  Change Photo
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-10 h-10 text-[#6b7280] group-hover:text-[#FE9A00] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-xs text-[#6b7280] group-hover:text-[#FE9A00] transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                                Add Photo
                              </span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-[#6b7280] mt-3 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Optional • Max 5MB • JPG, PNG, or WebP
                      </p>
                      <AnimatePresence>
                        {photoError && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 text-center"
                          >
                            {photoError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="block text-[#a8adb3] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full bg-[#2b3139] border-2 ${errors.name ? "border-red-500" : "border-[#FE9A00]/20"
                          } rounded-xl text-white px-5 py-3.5 focus:border-[#FE9A00] focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400, transition: 'all 200ms ease-in-out' }}
                        placeholder="John Doe"
                        required
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 ml-1"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-[#a8adb3] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full bg-[#2b3139] border-2 ${errors.email ? "border-red-500" : "border-[#FE9A00]/20"
                          } rounded-xl text-white px-5 py-3.5 focus:border-[#FE9A00] focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400, transition: 'all 200ms ease-in-out' }}
                        placeholder="athlete@gymtrackr.com"
                        required
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 ml-1"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-[#a8adb3] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500 }}>
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full bg-[#2b3139] border-2 ${errors.password ? "border-red-500" : "border-[#FE9A00]/20"
                          } rounded-xl text-white px-5 py-3.5 focus:border-[#FE9A00] focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400, transition: 'all 200ms ease-in-out' }}
                        placeholder="Create a strong password"
                        required
                      />

                      {/* Password Strength Indicator */}
                      {form.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3"
                        >
                          <div className="flex gap-1.5 mb-2">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full ${level <= passwordStrength
                                  ? strengthColor[passwordStrength - 1]
                                  : "bg-[#1a1d23]"
                                  } transition-colors duration-300`}
                              />
                            ))}
                          </div>
                          {passwordStrength > 0 && (
                            <p className="text-xs text-[#a8adb3]">
                              Strength: {strengthLabel[passwordStrength - 1]}
                            </p>
                          )}
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 ml-1"
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <label className="block text-[#a8adb3] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500 }}>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={`w-full bg-[#2b3139] border-2 ${errors.confirmPassword ? "border-red-500" : "border-[#FE9A00]/20"
                          } rounded-xl text-white px-5 py-3.5 focus:border-[#FE9A00] focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400, transition: 'all 200ms ease-in-out' }}
                        placeholder="Re-enter your password"
                        required
                      />
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 ml-1"
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,173,181,0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group mt-6"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, transition: 'all 200ms ease-in-out' }}
                    >
                      <span className="relative z-10">
                        {isLoading ? "Sending OTP..." : "Continue"}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FE9A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleVerifyOTP}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-[#a8adb3] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-[#1a1d23]/50 border border-white/10 rounded-xl text-white px-5 py-4 text-center text-2xl tracking-widest focus:border-[#FE9A00] focus:outline-none transition-all"
                        placeholder="000000"
                        maxLength={6}
                        required
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      <p className="text-xs text-[#6b7280] mt-2 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Check your email for the 6-digit code
                      </p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {isLoading ? "Verifying..." : "Create Account"}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => handleSendOTP({ preventDefault: () => { } })}
                      disabled={cooldown > 0 || isLoading}
                      className="w-full text-[#FE9A00] hover:text-[#FFA500] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-[#6b7280] hover:text-[#a8adb3] text-sm transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      ← Change email
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-3">
                <p className="text-[#a8adb3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#FE9A00] hover:text-[#FFA500] font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
                <Link
                  to="/"
                  className="text-[#6b7280] hover:text-[#a8adb3] text-sm transition-colors inline-flex items-center gap-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span>←</span> Back to home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(15px); }
          66% { transform: translateY(15px) translateX(-15px); }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
