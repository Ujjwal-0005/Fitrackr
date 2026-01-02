import React, { useEffect, useState } from "react";
import {
    getMe,
    updateOnboarding,
    fetchOverview,
    fetchWeekly,
    changePassword,
} from "../api/user";
import apiClient from "../api/apiClient";
import WeeklyChart from "../components/WeeklyChart";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import ThreeBackground from "../components/ThreeBackground";
import Icon from "../components/Icon";

const Profile = () => {
    const { user, setUser } = useAuth();

    const [form, setForm] = useState({
        sex: "",
        age: "",
        heightCm: "",
        weightKg: "",
        diet: "",
        activityLevel: "",
        equipment: [],
    });

    const [overview, setOverview] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [saving, setSaving] = useState(false);
    const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState("");
    const [avatar, setAvatar] = useState("");
    const [uploading, setUploading] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                // Add small delay to ensure cookies are fully set by browser
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!isMounted) return;

                const [meRes, overviewRes, weeklyRes] = await Promise.all([
                    getMe(),
                    fetchOverview(),
                    fetchWeekly(),
                ]);
                const me = meRes.data;
                const ob = me.onboarding || {};

                if (!isMounted) return;

                setUser(me);
                setForm({
                    sex: ob.sex || "",
                    age: ob.age || "",
                    heightCm: ob.heightCm || "",
                    weightKg: ob.weightKg || "",
                    diet: ob.diet || "",
                    activityLevel: ob.activityLevel || "",
                    equipment: Array.isArray(ob.equipment) ? ob.equipment : [],
                });
                setAvatar(me?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User");
                setBmi(me?.bmi);
                setBmiCategory(me?.bmiCategory);
                setOverview(overviewRes.data);
                setWeekly(weeklyRes.data);
            } catch (err) {
                if (isMounted) {
                    console.error("Profile data load error:", err.response?.status, err.message);
                    if (err.response?.status === 401) {
                        toast.error("Session expired. Please login again.");
                        window.location.href = "/login";
                    } else {
                        toast.error("Failed to load profile data");
                    }
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [setUser]);

    const handleOnboardingSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateOnboarding(form);
            setUser((prev) => ({ ...prev, onboarding: res.data.onboarding, bmi: res.data.bmi, bmiCategory: res.data.bmiCategory }));
            setBmi(res.data.bmi);
            setBmiCategory(res.data.bmiCategory);
            toast.success("Profile updated!");
        } catch (err) {
            toast.error("Error saving profile");
        } finally {
            setSaving(false);
        }
    };


    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await changePassword(pw);
            setPw({ currentPassword: "", newPassword: "" });
            toast.success("Password updated!");
        } catch {
            toast.error("Error changing password");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return toast.error("Only JPG, PNG, and WebP images are allowed");
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Image must be less than 5MB");
        }

        const preview = URL.createObjectURL(file);
        setAvatar(preview);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await apiClient.post("/users/me/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Update avatar with the response from backend
            if (response.data.avatarUrl) {
                setAvatar(response.data.avatarUrl);
                // Also update the user context
                setUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
            }

            toast.success("Avatar updated!");
        } catch {
            toast.error("Error uploading photo");
            // Revert to previous avatar on error
            const meRes = await getMe();
            setAvatar(meRes.data?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] relative" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Three.js Animated Background */}
            <ThreeBackground />

            <Navbar />

            {/* 1️⃣ IDENTITY HERO */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 overflow-hidden pt-32"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FE9A00]/5 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar with Progress Ring */}
                        <div className="relative group">
                            <svg className="absolute -inset-3 w-32 h-32 md:w-40 md:h-40" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(254,154,0,0.1)" strokeWidth="2" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="283" strokeDashoffset={283 - (283 * ((overview?.totalWorkouts || 0) / 50))} strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000" />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FE9A00" />
                                        <stop offset="100%" stopColor="#FFA500" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-[#FE9A00]/20">
                                <img
                                    src={avatar || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                                    alt={user?.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                    <span className="text-xs font-medium">{uploading ? "Uploading..." : "Change"}</span>
                                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                                </label>
                            </div>
                        </div>

                        {/* Identity Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FE9A00]/10 border border-[#FE9A00]/20 text-xs font-medium text-[#FE9A00] mb-3">
                                {user?.role?.toUpperCase()}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{user?.name}</h1>
                            <p className="text-[#a8adb3] mb-1">{user?.email}</p>
                            <p className="text-sm text-[#6b7280]">Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 2️⃣ HEALTH SNAPSHOT STRIP */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 border-y border-[#FE9A00]/10 bg-[#1a1d23]/30"
            >
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6">Your Health Now</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <HealthStat label="BMI" value={bmi || "—"} unit={bmiCategory} />
                        <HealthStat label="Weight" value={form.weightKg || "—"} unit="kg" />
                        <HealthStat label="Height" value={form.heightCm || "—"} unit="cm" />
                        <HealthStat label="Activity" value={form.activityLevel || "—"} unit="" />
                    </div>
                </div>
            </motion.section>

            {/* 3️⃣ PROGRESS NARRATIVE */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative z-10 py-16 bg-gradient-to-b from-transparent via-[#1a1d23]/10 to-transparent"
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">Your Progress</h2>
                            <p className="text-zinc-400">Last 7 days of training</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{overview?.totalWorkouts || 0}</p>
                            <p className="text-sm text-zinc-500">Total Workouts</p>
                        </div>
                    </div>
                    <div className="h-64 md:h-80">
                        <WeeklyChart data={weekly} />
                    </div>
                </div>
            </motion.section>


            {/* 4️⃣ EDITABLE PROFILE */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative z-10 py-16 border-t border-[#FE9A00]/10"
            >
                <div className="max-w-3xl mx-auto px-6 space-y-4">
                    <AccordionSection
                        title="Basic Information"
                        isExpanded={expandedSection === "basic"}
                        onToggle={() => setExpandedSection(expandedSection === "basic" ? null : "basic")}
                    >
                        <form onSubmit={handleOnboardingSave} className="space-y-6 pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <SegmentedControl
                                    label="Sex"
                                    value={form.sex}
                                    onChange={(v) => setForm({ ...form, sex: v })}
                                    options={[
                                        { value: "male", label: "Male" },
                                        { value: "female", label: "Female" },
                                        { value: "other", label: "Other" }
                                    ]}
                                />
                                <CleanInput label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <CleanInput label="Height" type="number" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} unit="cm" />
                                <CleanInput label="Weight" type="number" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} unit="kg" />
                            </div>
                            <SegmentedControl
                                label="Diet Preference"
                                value={form.diet}
                                onChange={(v) => setForm({ ...form, diet: v })}
                                options={[
                                    { value: "veg", label: "Vegetarian" },
                                    { value: "nonveg", label: "Non-Veg" },
                                    { value: "vegan", label: "Vegan" },
                                    { value: "other", label: "Other" }
                                ]}
                            />
                            <SegmentedControl
                                label="Activity Level"
                                value={form.activityLevel}
                                onChange={(v) => setForm({ ...form, activityLevel: v })}
                                options={[
                                    { value: "sedentary", label: "Sedentary" },
                                    { value: "light", label: "Light" },
                                    { value: "moderate", label: "Moderate" },
                                    { value: "high", label: "High" }
                                ]}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-semibold rounded-lg hover:from-[#FE9A00]/90 hover:to-[#FFA500]/90 transition-all disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </motion.button>
                        </form>
                    </AccordionSection>
                </div>
            </motion.section>

            {/* 5️⃣ SECURITY ZONE */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative z-10 py-16 bg-[#1a1d23]/20 border-t border-[#FE9A00]/10"
            >
                <div className="max-w-2xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Security & Privacy</h2>
                    </div>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <CleanInput
                            label="Current Password"
                            type="password"
                            value={pw.currentPassword}
                            onChange={(v) => setPw({ ...pw, currentPassword: v })}
                        />
                        <CleanInput
                            label="New Password"
                            type="password"
                            value={pw.newPassword}
                            onChange={(v) => setPw({ ...pw, newPassword: v })}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full md:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Update Password
                        </motion.button>
                    </form>
                </div>
            </motion.section>
        </div>
    );
};

const HealthStat = ({ label, value, unit }) => (
    <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold">{value}</span>
            {unit && <span className="text-sm text-zinc-400">{unit}</span>}
        </div>
    </div>
);


const AccordionSection = ({ title, isExpanded, onToggle, children }) => (
    <motion.div
        initial={false}
        className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30"
    >
        <button
            onClick={onToggle}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
        >
            <span className="font-semibold">{title}</span>
            <motion.svg
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
        </button>
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                    <div className="px-6 pb-6">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const CleanInput = ({ label, type = "text", value, onChange, placeholder, unit }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE9A00]/50 focus:border-transparent transition-all"
            />
            {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                    {unit}
                </span>
            )}
        </div>
    </div>
);

const SegmentedControl = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-3">{label}</label>
        <div className="inline-flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${value === opt.value
                        ? "bg-[#FE9A00] text-black shadow-lg"
                        : "text-zinc-400 hover:text-white"
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export default Profile;
