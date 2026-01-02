import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Import fitness images
import fitnessImg1 from "../assets/images/fitness-1.png";
import fitnessImg2 from "../assets/images/fitness-2.png";
import fitnessImg3 from "../assets/images/fitness-3.jpg";
import fitnessImg4 from "../assets/images/fitness-4.png";
import fitnessImg5 from "../assets/images/fitness-5.png";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const sectionsRef = useRef([]);
  const canvasRef = useRef(null);
  const overlapSectionsRef = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Floating particle system
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
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
        // Mix of orange and red particles
        const colors = [
          { r: 254, g: 154, b: 0 },   // Orange
          { r: 255, g: 107, b: 53 },  // Orange-Red
          { r: 239, g: 68, b: 68 }    // Red
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(34, 40, 49, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(254, 154, 0, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
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

  useEffect(() => {
    // GSAP scroll-triggered animations for sections
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(
          section,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // PREMIUM OVERLAPPING SCROLL EFFECT
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      overlapSectionsRef.current.forEach((section, index) => {
        if (!section) return;

        // Pin each section
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          scrub: true,
        });

        // Scale down and fade as next section approaches
        gsap.to(section, {
          scale: 0.8,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  // ADVANCED GSAP ANIMATIONS FOR FITNESS IMAGES
  useEffect(() => {
    // Parallax effect for images
    const images = [
      '.fitness-image-1',
      '.fitness-image-2',
      '.fitness-image-3',
      '.fitness-image-4',
      '.fitness-image-5'
    ];

    images.forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (!element) return;

      // Parallax scroll effect
      gsap.to(element, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      // Image reveal with scale
      const img = element.querySelector('img');
      if (img) {
        gsap.fromTo(img,
          { scale: 1.2, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none none",
            }
          }
        );
      }

      // Text overlay fade-in
      const textOverlay = element.querySelector('.absolute.bottom-0');
      if (textOverlay) {
        gsap.fromTo(textOverlay,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 75%",
              toggleActions: "play none none none",
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && images.some(sel => trigger.vars.trigger.matches?.(sel))) {
          trigger.kill();
        }
      });
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Slow-Moving Ambient Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large floating orbs */}
        <div
          className="absolute w-[700px] h-[700px] bg-[#FE9A00]/3 rounded-full blur-3xl"
          style={{ animation: "float 25s ease-in-out infinite", top: '10%', right: '5%' }}
        />
        <div
          className="absolute w-[800px] h-[800px] bg-gradient-to-br from-[#FE9A00]/2 to-[#EF4444]/1 rounded-full blur-3xl"
          style={{ animation: "float 30s ease-in-out infinite 5s", bottom: '15%', left: '10%' }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-[#1a1d23]/15 rounded-full blur-3xl"
          style={{ animation: "float 35s ease-in-out infinite 10s", top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        {/* Geometric shapes */}
        <div
          className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-[#FE9A00]/2 to-[#EF4444]/1.5 blur-2xl rotate-45"
          style={{ animation: "float 40s ease-in-out infinite 2s", top: '20%', left: '70%' }}
        />
        <div
          className="absolute w-[350px] h-[350px] bg-[#FE9A00]/1.5 rounded-full blur-2xl"
          style={{ animation: "float 28s ease-in-out infinite 7s", bottom: '30%', right: '15%' }}
        />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E')" }}
      />

      {/* HERO SECTION - ELITE ATHLETIC DESIGN */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text + CTAs */}
            <div className="space-y-8">
              {/* Performance Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-block px-4 py-2 rounded-full border border-[#EF4444]/40 bg-black/30 backdrop-blur-sm shadow-lg shadow-[#EF4444]/10">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#EF4444] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    NEXT-GEN FITNESS TRACKING
                  </span>
                </div>
              </motion.div>

              {/* Training Timer / Clock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-2"
              >
                <div className="text-xs text-[#6b7280] uppercase tracking-[0.3em] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  TRAINING SESSION
                </div>
                <motion.div
                  className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] tracking-tight font-mono tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  {formatTime()}
                </motion.div>
                <div className="text-sm text-[#6b7280] font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </motion.div>

              {/* Greeting + Intent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="text-sm text-[#6b7280] uppercase tracking-[0.25em] font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {getGreeting()}
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                  <span className="text-white">{user?.name || "ATHLETE"}</span>
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-16 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444]"></div>
                  <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#EF4444] uppercase tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    TRAIN WITH INTENT
                  </p>
                </div>
              </motion.div>

              {/* Performance Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                {["POWER", "CONSISTENCY", "PROGRESS", "DISCIPLINE"].map((keyword, i) => (
                  <motion.div
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="px-4 py-2 bg-black/40 border border-[#FE9A00]/20 rounded-lg"
                  >
                    <span className="text-xs font-bold text-[#6b7280] tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {keyword}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.button
                  onClick={() => navigate("/workout-plans")}
                  whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-[#FE9A00] to-[#FFA500] font-bold text-black text-lg overflow-hidden"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Training
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => navigate("/dashboard")}
                  whileHover={{ scale: 1.04, borderColor: "rgba(254,154,0,0.6)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-4 rounded-xl border-2 border-[#FE9A00]/40 bg-black/20 backdrop-blur-sm text-[#FE9A00] font-bold text-lg hover:bg-black/40 transition-all"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  View Dashboard
                </motion.button>
              </motion.div>

              {/* Stats with Hover & Count Animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-3 gap-4 pt-8"
              >
                <PerformanceStatCard number="500K+" label="Athletes" delay={0.7} />
                <PerformanceStatCard number="2.5M+" label="Workouts" delay={0.8} />
                <PerformanceStatCard number="98%" label="Rate" delay={0.9} />
              </motion.div>
            </div>

            {/* RIGHT: Kinetic Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[600px] hidden lg:flex items-center justify-center"
            >
              {/* Circular Progress Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  {/* Ring 1 - Outer */}
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="180"
                    fill="none"
                    stroke="#FE9A00"
                    strokeWidth="2"
                    strokeOpacity="0.15"
                    strokeDasharray="1130"
                    animate={{ strokeDashoffset: [0, -1130] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="180"
                    fill="none"
                    stroke="#FE9A00"
                    strokeWidth="3"
                    strokeDasharray="800 1130"
                    strokeLinecap="round"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "200px 200px" }}
                  />

                  {/* Ring 2 - Middle */}
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="140"
                    fill="none"
                    stroke="#FFA500"
                    strokeWidth="2"
                    strokeOpacity="0.2"
                    strokeDasharray="880"
                    animate={{ strokeDashoffset: [0, 880] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="140"
                    fill="none"
                    stroke="#FFA500"
                    strokeWidth="3"
                    strokeDasharray="600 880"
                    strokeLinecap="round"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "200px 200px" }}
                  />

                  {/* Ring 3 - Inner */}
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="100"
                    fill="none"
                    stroke="#FE9A00"
                    strokeWidth="2"
                    strokeOpacity="0.25"
                    strokeDasharray="628"
                    animate={{ strokeDashoffset: [0, -628] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="100"
                    fill="none"
                    stroke="#FE9A00"
                    strokeWidth="4"
                    strokeDasharray="400 628"
                    strokeLinecap="round"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "200px 200px" }}
                  />

                  {/* Center Glow */}
                  <circle
                    cx="200"
                    cy="200"
                    r="40"
                    fill="url(#centerGlow)"
                  />

                  <defs>
                    <radialGradient id="centerGlow">
                      <stop offset="0%" stopColor="#FE9A00" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FE9A00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Vertical Intensity Bars */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-2 h-32">
                {[65, 45, 80, 55, 90, 70, 50, 85, 60, 75].map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#FE9A00] to-[#FFA500] rounded-full"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${height}%`,
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                      height: { delay: i * 0.1, duration: 0.8 },
                      opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                    }}
                  />
                ))}
              </div>

              {/* ECG / Waveform Line */}
              <div className="absolute top-1/3 left-0 right-0">
                <svg className="w-full h-20" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <motion.path
                    d="M0,40 L50,40 L60,20 L70,60 L80,40 L130,40 L140,30 L150,50 L160,40 L210,40 L220,25 L230,55 L240,40 L290,40 L300,35 L310,45 L320,40 L400,40"
                    fill="none"
                    stroke="#FE9A00"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* OVERLAPPING SCROLL SECTIONS */}
      <div className="relative">
        {/* Section 1: POWER */}
        <section
          ref={(el) => (overlapSectionsRef.current[0] = el)}
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1f27] via-[#0f1115] to-[#2a3038] z-20"
        >
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ADB5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
          />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <div className="inline-block px-6 py-3 bg-[#FE9A00]/10 backdrop-blur-xl border border-[#FE9A00]/30 rounded-full mb-6">
                  <span className="text-sm font-bold text-[#FE9A00] uppercase tracking-widest">
                    01 / STRENGTH
                  </span>
                </div>
              </div>
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
                UNLEASH YOUR
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">
                  POWER
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-[#a8adb3] max-w-3xl mx-auto font-light leading-relaxed">
                Track every lift, analyze every set, and watch your strength metrics soar.
                Progressive overload has never been this precise.
              </p>
              <div className="mt-12 flex gap-4 justify-center">
                <div className="px-8 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <div className="text-4xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>500+</div>
                  <div className="text-sm text-[#a8adb3] uppercase tracking-wider">Exercises</div>
                </div>
                <div className="px-8 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <div className="text-4xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>24/7</div>
                  <div className="text-sm text-[#a8adb3] uppercase tracking-wider">Tracking</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: PROGRESS */}
        <section
          ref={(el) => (overlapSectionsRef.current[1] = el)}
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2a3038] via-[#1a1d23] to-[#3a404a] z-30"
        >
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2300ADB5' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E')" }}
          />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <div className="inline-block px-6 py-3 bg-[#FE9A00]/10 backdrop-blur-xl border border-[#FE9A00]/30 rounded-full mb-6">
                  <span className="text-sm font-bold text-[#FE9A00] uppercase tracking-widest">
                    02 / ANALYTICS
                  </span>
                </div>
              </div>
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
                TRACK YOUR
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">
                  PROGRESS
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-[#a8adb3] max-w-3xl mx-auto font-light leading-relaxed">
                Visualize your strength gains with advanced charts. Every workout logged,
                every PR celebrated, every trend analyzed.
              </p>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="px-6 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <svg className="w-10 h-10 mx-auto text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-sm text-[#a8adb3] mt-2">Charts</div>
                </div>
                <div className="px-6 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <svg className="w-10 h-10 mx-auto text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div className="text-sm text-[#a8adb3] mt-2">Trends</div>
                </div>
                <div className="px-6 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <svg className="w-10 h-10 mx-auto text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-[#a8adb3] mt-2">Goals</div>
                </div>
                <div className="px-6 py-4 bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl">
                  <svg className="w-10 h-10 mx-auto text-[#FE9A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div className="text-sm text-[#a8adb3] mt-2">Records</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: ACHIEVE */}
        <section
          ref={(el) => (overlapSectionsRef.current[2] = el)}
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3a404a] via-[#0f1115] to-[#1a1f27] z-40"
        >
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ADB5' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
          />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <div className="inline-block px-6 py-3 bg-[#FE9A00]/10 backdrop-blur-xl border border-[#FE9A00]/30 rounded-full mb-6">
                  <span className="text-sm font-bold text-[#FE9A00] uppercase tracking-widest">
                    03 / RESULTS
                  </span>
                </div>
              </div>
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
                ACHIEVE YOUR
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#FFA500]">
                  GOALS
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-[#a8adb3] max-w-3xl mx-auto font-light leading-relaxed mb-12">
                Set SMART goals, stay accountable, and crush your personal records.
                Your transformation starts now.
              </p>
              <div className="flex gap-4 justify-center">
                <PrimaryButton onClick={() => navigate("/smart-goal")}>
                  <span className="flex items-center gap-2">
                    Get Started
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/dashboard")}>
                  View Dashboard
                </SecondaryButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Spacer to allow final section to scroll out */}
        <div className="h-screen bg-[#0f1115]"></div>
      </div>

      {/* FITNESS LIFESTYLE GALLERY - GSAP SCROLL ANIMATIONS */}
      <section className="relative py-32 bg-gradient-to-b from-[#0f1115] via-[#1a1d23] to-[#0f1115] overflow-hidden z-10">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FE9A00]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EF4444]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-6 py-3 bg-[#FE9A00]/10 backdrop-blur-xl border border-[#FE9A00]/30 rounded-full mb-6">
                <span className="text-sm font-bold text-[#FE9A00] uppercase tracking-widest">
                  Transform Your Life
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                Your Fitness
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#EF4444]">
                  Journey Starts Here
                </span>
              </h2>
              <p className="text-xl text-[#a8adb3] max-w-2xl mx-auto">
                Join thousands of athletes transforming their bodies and minds through dedicated training
              </p>
            </motion.div>
          </div>

          {/* Image Grid with GSAP Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Image 1 - Dynamic Movement */}
            <motion.div
              className="fitness-image-1 relative group overflow-hidden rounded-3xl aspect-[4/5]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={fitnessImg1}
                alt="Dynamic Fitness Training"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Dynamic Movement
                </h3>
                <p className="text-sm text-[#a8adb3]">
                  Power through every workout
                </p>
              </div>
            </motion.div>

            {/* Image 2 - Mindful Practice */}
            <motion.div
              className="fitness-image-2 relative group overflow-hidden rounded-3xl aspect-[4/5]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={fitnessImg2}
                alt="Mindful Yoga Practice"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Mind & Body
                </h3>
                <p className="text-sm text-[#a8adb3]">
                  Balance strength with flexibility
                </p>
              </div>
            </motion.div>

            {/* Image 3 - Professional Environment */}
            <motion.div
              className="fitness-image-3 relative group overflow-hidden rounded-3xl aspect-[4/5]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={fitnessImg3}
                alt="Professional Gym Environment"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Elite Training
                </h3>
                <p className="text-sm text-[#a8adb3]">
                  Professional-grade facilities
                </p>
              </div>
            </motion.div>

            {/* Image 4 - Partner Training (spans 2 columns on lg) */}
            <motion.div
              className="fitness-image-4 relative group overflow-hidden rounded-3xl aspect-[4/5] lg:col-span-2 lg:aspect-[16/9]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={fitnessImg4}
                alt="Partner Training"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Train Together, Grow Together
                </h3>
                <p className="text-base text-[#a8adb3] max-w-2xl">
                  Build accountability and motivation with workout partners
                </p>
              </div>
            </motion.div>

            {/* Image 5 - Achievement */}
            <motion.div
              className="fitness-image-5 relative group overflow-hidden rounded-3xl aspect-[4/5]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <img
                src={fitnessImg5}
                alt="Fitness Achievement"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Celebrate Wins
                </h3>
                <p className="text-sm text-[#a8adb3]">
                  Every milestone matters
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <motion.button
              onClick={() => navigate("/workout-plans")}
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(254,154,0,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-black text-xl rounded-xl shadow-2xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Begin Your Transformation
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FEATURE SECTIONS - Alternating Layout */}
      <div className="relative z-10">
        {/* Section 1: Smart Goals - Content Left, CTA Right */}
        <section
          ref={(el) => (sectionsRef.current[0] = el)}
          className="py-20 md:py-32 bg-[#1a1d23]"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Goal Driven
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Set Goals That{" "}
                  <span className="text-[#FE9A00]">Drive Results</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Build SMART goals with AI-powered insights. Track progress in
                  real-time and stay motivated with intelligent reminders.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <PrimaryButton onClick={() => navigate("/smart-goal")}>
                  Create Smart Goal
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Workout Plans - CTA Left, Content Right */}
        <section
          ref={(el) => (sectionsRef.current[1] = el)}
          className="py-20 md:py-32"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <PrimaryButton onClick={() => navigate("/workout-plans")}>
                  Browse Plans
                </PrimaryButton>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Structured Training
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Follow Expert{" "}
                  <span className="text-[#FE9A00]">Workout Programs</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Access 6-day structured programs designed by fitness experts.
                  Progressive overload, periodization, and proven results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Smart Workout Session - Content Left, CTA Right */}
        <section
          ref={(el) => (sectionsRef.current[2] = el)}
          className="py-20 md:py-32 bg-[#1a1d23]"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Live Tracking
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Track Every Rep{" "}
                  <span className="text-[#FE9A00]">In Real-Time</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Live workout sessions with built-in timers, rest tracking, and
                  instant form feedback. Every set logged with precision.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <PrimaryButton onClick={() => navigate("/workout-session")}>
                  Start Session
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Personal Records - CTA Left, Content Right */}
        <section
          ref={(el) => (sectionsRef.current[3] = el)}
          className="py-20 md:py-32"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <PrimaryButton onClick={() => navigate("/personal-records")}>
                  View Records
                </PrimaryButton>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Peak Performance
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Chase Your{" "}
                  <span className="text-[#FE9A00]">Personal Bests</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Track your strongest lifts across every exercise. Celebrate
                  new PRs and push your limits with data-driven confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Nutrition - Content Left, CTA Right */}
        <section
          ref={(el) => (sectionsRef.current[4] = el)}
          className="py-20 md:py-32 bg-[#1a1d23]"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Fuel Your Progress
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Master Your{" "}
                  <span className="text-[#FE9A00]">Nutrition Game</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Track macros, plan meals, and optimize your diet for muscle
                  growth. Results are built in the kitchen.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <PrimaryButton onClick={() => navigate("/nutrition")}>
                  Track Nutrition
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Analytics - CTA Left, Content Right */}
        <section
          ref={(el) => (sectionsRef.current[5] = el)}
          className="py-20 md:py-32"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <PrimaryButton onClick={() => navigate("/dashboard")}>
                  View Analytics
                </PrimaryButton>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#FE9A00] uppercase tracking-widest">
                    Data-Driven
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Track Progress{" "}
                  <span className="text-[#FE9A00]">With Precision</span>
                </h2>
                <p className="text-lg md:text-xl text-[#a8adb3] leading-relaxed">
                  Visualize strength gains, volume trends, and workout
                  consistency. Make smarter training decisions with insights.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#1a1d23] border-t border-[#4a5058]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start mb-12">
            {/* Left: Branding */}
            <div>
              <h3 className="text-2xl font-extrabold text-[#FE9A00] mb-3">
                FITRACKR
              </h3>
              <p className="text-[#a8adb3] text-base max-w-md">
                Consistency over perfection. Every rep counts. Every set matters.
              </p>
            </div>

            {/* Right: Navigation */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-[#EEEEEE] uppercase tracking-wider mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  <FooterLink onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </FooterLink>
                  <FooterLink onClick={() => navigate("/workout-plans")}>
                    Workouts
                  </FooterLink>
                  <FooterLink onClick={() => navigate("/smart-goal")}>
                    Goals
                  </FooterLink>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#EEEEEE] uppercase tracking-wider mb-4">
                  Resources
                </h4>
                <ul className="space-y-3">
                  <FooterLink onClick={() => navigate("/personal-records")}>
                    Records
                  </FooterLink>
                  <FooterLink onClick={() => navigate("/nutrition")}>
                    Nutrition
                  </FooterLink>
                  <FooterLink onClick={() => navigate("/profile")}>
                    Profile
                  </FooterLink>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-[#4a5058]">
            <p className="text-sm text-[#6b7280] text-center">
              © {new Date().getFullYear()} Fitrackr. Built for athletes who
              demand more.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// PERFORMANCE STAT CARD - Athletic Design with Hover
const PerformanceStatCard = ({ number, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -6, borderColor: "rgba(254,154,0,0.4)" }}
      className="rounded-xl border border-[#FE9A00]/20 bg-black/30 backdrop-blur-sm p-4 transition-all cursor-default"
    >
      <div className="text-3xl font-black text-[#FE9A00] mb-1 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {number}
      </div>
      <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {label}
      </div>
    </motion.div>
  );
};

// PRIMARY BUTTON - Modern Glassmorphic Design
const PrimaryButton = ({ children, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-[#0a0e13] font-bold text-base md:text-lg px-10 py-4 md:px-12 md:py-5 rounded-2xl shadow-xl hover:shadow-[#FE9A00]/40 transition-all duration-300 overflow-hidden group"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FE9A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// SECONDARY BUTTON
const SecondaryButton = ({ children, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-[#1a1d23]/40 backdrop-blur-xl border-2 border-[#FE9A00]/40 text-[#FE9A00] font-bold text-base md:text-lg px-10 py-4 md:px-12 md:py-5 rounded-2xl hover:bg-[#1a1d23]/60 hover:border-[#FE9A00]/60 transition-all duration-300"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {children}
    </motion.button>
  );
};

// STAT BADGE
const StatBadge = ({ number, label }) => {
  return (
    <div className="bg-[#1a1d23]/30 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl p-4 md:p-6 hover:border-[#FE9A00]/40 transition-all duration-300">
      <div className="text-2xl md:text-3xl font-black text-[#FE9A00] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {number}
      </div>
      <div className="text-xs md:text-sm text-[#a8adb3] uppercase tracking-wider font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {label}
      </div>
    </div>
  );
};

// FOOTER LINK
const FooterLink = ({ children, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className="text-[#a8adb3] hover:text-[#FE9A00] transition-colors duration-200 text-sm"
      >
        {children}
      </button>
    </li>
  );
};

export default Home;
