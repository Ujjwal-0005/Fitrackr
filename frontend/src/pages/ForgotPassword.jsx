import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = "http://localhost:8080/api/v1";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    // Cooldown timer
    useState(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/auth/forgot-password/send-otp`, { email });
            toast.success("OTP sent to your email!");
            setStep(2);
            setCooldown(60); // 60 second cooldown
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters!");
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/auth/forgot-password/reset`, {
                email,
                otp,
                newPassword,
            });
            toast.success("Password reset successful! Please login.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute w-[600px] h-[600px] bg-[#FE9A00]/10 rounded-full blur-3xl"
                    style={{ animation: "float 25s ease-in-out infinite", top: "10%", right: "5%" }}
                />
                <div
                    className="absolute w-[500px] h-[500px] bg-[#FE9A00]/15 rounded-full blur-3xl"
                    style={{ animation: "float 30s ease-in-out infinite 5s", bottom: "10%", left: "10%" }}
                />
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <img src="/photo_2025-12-17_22-41-59.png" alt="GymTrackr Logo" className="h-16 w-auto" />
                </Link>

                {/* Card */}
                <div className="bg-[#1a1d23]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Reset Password
                        </h1>
                        <p className="text-[#a8adb3]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {step === 1 ? "Enter your email to receive an OTP" : "Enter OTP and new password"}
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
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-[#a8adb3] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0f1115]/50 border border-white/10 rounded-xl text-white px-5 py-4 focus:border-[#FE9A00] focus:outline-none transition-all placeholder:text-[#6b7280]"
                                        placeholder="athlete@gymtrackr.com"
                                        required
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Sending..." : "Send OTP"}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-[#a8adb3] mb-2">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full bg-[#0f1115]/50 border border-white/10 rounded-xl text-white px-5 py-4 text-center text-2xl tracking-widest focus:border-[#FE9A00] focus:outline-none transition-all"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-xs text-[#6b7280] mt-2 text-center">
                                        Check your email for the 6-digit code
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a8adb3] mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#0f1115]/50 border border-white/10 rounded-xl text-white px-5 py-4 focus:border-[#FE9A00] focus:outline-none transition-all placeholder:text-[#6b7280]"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a8adb3] mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[#0f1115]/50 border border-white/10 rounded-xl text-white px-5 py-4 focus:border-[#FE9A00] focus:outline-none transition-all placeholder:text-[#6b7280]"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => handleSendOTP({ preventDefault: () => { } })}
                                    disabled={cooldown > 0 || isLoading}
                                    className="w-full text-[#FE9A00] hover:text-[#FFA500] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="text-[#6b7280] hover:text-[#a8adb3] text-sm transition-colors inline-flex items-center gap-2"
                        >
                            <span>←</span> Back to login
                        </Link>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(15px); }
          66% { transform: translateY(15px) translateX(-15px); }
        }
      `}</style>
        </div>
    );
};

export default ForgotPassword;
