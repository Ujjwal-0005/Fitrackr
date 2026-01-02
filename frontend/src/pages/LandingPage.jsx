import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import videoBg from "../assets/bg.mp4";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const heroRef = useRef(null);
  const narrativeRefs = useRef([]);
  const ctaRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hero entrance animation
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      heroRef.current.querySelector("h1"),
      { opacity: 0, y: 60, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.3 }
    ).fromTo(
      heroRef.current.querySelector("p"),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    ).fromTo(
      heroRef.current.querySelectorAll("button"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
      "-=0.4"
    );

    // Parallax overlay on scroll
    gsap.to(overlayRef.current, {
      y: 150,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Narrative text reveals
    narrativeRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 80,
            clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)"
          },
          {
            opacity: 1,
            y: 0,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 50%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    // CTA pulse effect
    if (ctaRef.current) {
      gsap.to(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.fromTo(
              ctaRef.current,
              { scale: 0.9, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)" }
            );
          },
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const narratives = [
    "Train with intent.",
    "Progress is measurable.",
    "Your body adapts. So should your plan.",
    "Discipline over motivation."
  ];

  return (
    <div className="relative min-h-screen bg-[#0f1115] text-[#EEEEEE] overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          src={videoBg}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Triple gradient overlay for depth - Updated with red accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/90 via-[#0f1115]/70 to-[#0f1115]/90" />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-br from-[#FE9A00]/10 via-[#EF4444]/5 to-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-[#EF4444]/8 via-transparent to-transparent" />
      </div>

      {/* Logo Only - Floating */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <img
            src="/photo_2025-12-17_22-41-59.png"
            alt="GymTrackr Logo"
            className="h-16 w-auto"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
      >
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Built for the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444]">committed</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#a8adb3] max-w-2xl mx-auto font-light tracking-wide">
            Your body doesn't guess. Neither should your training.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-4 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] text-black font-bold text-lg rounded-xl overflow-hidden shadow-lg shadow-[#EF4444]/20"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="relative z-10">Start Training</span>
              <motion.div
                className="absolute inset-0 bg-[#FFA500]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, borderColor: "rgba(239,68,68,0.6)", boxShadow: "0 0 20px rgba(239,68,68,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 border-2 border-[#EF4444]/40 bg-black/20 backdrop-blur-sm text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#EF4444] font-bold text-lg rounded-xl hover:bg-black/40 transition-all"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Sign In
            </motion.button>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-[#1a1d23] rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-[#FE9A00] rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Value Narrative Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-32 bg-[#1a1d23]/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto space-y-24">
          {narratives.map((text, i) => (
            <div
              key={i}
              ref={(el) => (narrativeRefs.current[i] = el)}
              className="opacity-0"
            >
              <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {text}
              </h2>
              {i < narratives.length - 1 && (
                <div className="mt-8 w-24 h-0.5 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#0f1115]/80 to-[#0f1115]">
        <div ref={ctaRef} className="text-center space-y-8 opacity-0">
          <h2 className="text-6xl md:text-7xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to commit?
          </h2>

          <p className="text-xl text-[#a8adb3] max-w-xl mx-auto">
            Join athletes who track with precision and train with purpose.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(254,154,0,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-gradient-to-r from-[#FE9A00] via-[#FF6B35] to-[#EF4444] text-black font-bold text-xl rounded-xl shadow-xl shadow-[#EF4444]/30"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Create Account
            </motion.button>

            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 border-2 border-[#EF4444] text-transparent bg-clip-text bg-gradient-to-r from-[#FE9A00] to-[#EF4444] font-bold text-xl rounded-xl hover:bg-[#EF4444]/10 hover:shadow-lg hover:shadow-[#EF4444]/20 transition-all"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="relative z-10 border-t border-[#1a1d23] bg-[#0f1115]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#6b7280]">
          <div className="font-bold text-white mb-4 md:mb-0" style={{ fontFamily: "'Outfit', sans-serif" }}>Fitrackr</div>
          <div className="flex gap-8">
            <button className="hover:text-[#FE9A00] transition-colors">Privacy</button>
            <button className="hover:text-[#FE9A00] transition-colors">Terms</button>
            <button className="hover:text-[#FE9A00] transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
