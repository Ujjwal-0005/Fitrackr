import { useState, useEffect, useRef } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const formRef = useRef(null);
  const canvasRef = useRef(null);

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
        ctx.fillStyle = `rgba(254, 154, 0, ${this.opacity})`;
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

  const validateField = (name, value) => {
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      return "Invalid email format";
    }
    if (name === "password" && value && value.length < 6) {
      return "Password too short";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateField("email", form.email);
    const passwordError = validateField("password", form.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser(form);
      const { user } = res.data;

      // Token is now stored in HttpOnly cookie by backend
      // No need to store in localStorage
      setUser(user);

      toast.success(`Welcome back, ${user.name || "Athlete"}!`);

      // Redirect based on role and basic information completion
      if (user.role === "admin") {
        navigate("/admin");
      } else if (!user.onboarding || !user.onboarding.sex || !user.onboarding.age || !user.onboarding.heightCm || !user.onboarding.weightKg) {
        // User hasn't filled basic information - redirect to profile
        toast.info("Please complete your basic information to get started!");
        navigate("/profile?firstTime=true");
      } else {
        navigate("/home");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Left Section - Visual/Brand */}
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
                Train Smarter.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">Track Better.</span>
              </h1>
              <p className="text-[#a8adb3] max-w-md" style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 400 }}>
                Your intelligent training partner that adapts to your progress and pushes you forward.
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
                      background: 'rgba(254, 154, 0, 0.15)',
                      boxShadow: '0 0 20px rgba(254, 154, 0, 0.3)'
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#FE9A00',
                        boxShadow: '0 0 8px rgba(254, 154, 0, 0.8), 0 0 12px rgba(254, 154, 0, 0.4)'
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Mobile logo */}
        <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <img src="/photo_2025-12-17_22-41-59.png" alt="GymTrackr Logo" className="h-10 w-auto" />

        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md relative"
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
              <div className="mb-10">
                <h1 className="font-semibold text-white mb-3" style={{ fontFamily: "'Space Grotesk', 'Sora', sans-serif", fontSize: "36px", letterSpacing: "-0.03em" }}>
                  Welcome back
                </h1>
                <p className="text-[#a8adb3]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 400 }}>
                  Continue your training journey
                </p>
              </div>

              {/* Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
                      } rounded-xl text-white px-5 py-4 focus:border-[#FE9A00] focus:outline-none transition-all duration-200 ease-in-out placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400 }}
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
                      } rounded-xl text-white px-5 py-4 focus:border-[#FE9A00] focus:outline-none transition-all duration-200 ease-in-out placeholder:text-[#9ca3af] placeholder:opacity-80 shadow-lg`}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400 }}
                    placeholder="Enter your password"
                    required
                  />
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
                  <div className="text-right mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-[#FE9A00] hover:text-[#FFA500] text-sm font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(254,154,0,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    transition: 'all 200ms ease-in-out'
                  }}
                >
                  <span className="relative z-10">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FE9A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-[#a8adb3]">
                  New to GymTrackr?{" "}
                  <Link
                    to="/register"
                    className="text-[#FE9A00] hover:text-[#FFA500] font-semibold"
                    style={{ transition: 'color 200ms ease-in-out' }}
                  >
                    Create account
                  </Link>
                </p>
                <Link
                  to="/"
                  className="text-[#6b7280] hover:text-[#a8adb3] text-sm inline-flex items-center gap-2"
                  style={{ transition: 'color 200ms ease-in-out' }}
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
    </div >
  );
};

export default Login;
