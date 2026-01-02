import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { getAllUsers } from '../../api/admin';
import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/admin`,
    withCredentials: true, // Enable cookies
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to load users:', err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await API.post('/users', formData);
            toast.success('✅ User created successfully!');
            setShowCreateModal(false);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await API.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const viewUserProgress = async (userId) => {
        try {
            const res = await API.get(`/users/${userId}/progress`);
            setSelectedUser(res.data);
        } catch (err) {
            toast.error('Failed to load user progress');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="inline-block px-4 py-2 rounded-full border border-[#FE9A00]/40 bg-black/30 backdrop-blur-sm mb-4">
                        <span className="text-[#FE9A00] text-xs font-bold tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ADMIN DASHBOARD
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                        User Management
                    </h1>
                    <div className="flex gap-4">
                        <motion.button
                            onClick={() => setShowCreateModal(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-bold"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            + Create User
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 p-6 rounded-2xl">
                        <p className="text-sm text-[#6b7280] uppercase tracking-wider mb-2">Total Users</p>
                        <p className="text-4xl font-black text-[#FE9A00]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {users.length}
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            className="w-16 h-16 border-4 border-[#FE9A00] border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                ) : (
                    <div className="bg-[#1a1d23]/40 backdrop-blur-xl border border-[#FE9A00]/20 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-black/40">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#FE9A00] uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#FE9A00] uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#FE9A00] uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#FE9A00] uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-[#FE9A00] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-t border-[#FE9A00]/10 hover:bg-black/20 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-[#a8adb3]">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin'
                                                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                                                : 'bg-[#FE9A00]/20 border border-[#FE9A00]/40 text-[#FE9A00]'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#a8adb3]">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => viewUserProgress(user._id)}
                                                    className="px-4 py-2 bg-[#FE9A00]/20 border border-[#FE9A00]/40 rounded-lg text-[#FE9A00] text-sm font-bold hover:bg-[#FE9A00]/30 transition-colors"
                                                >
                                                    View
                                                </button>
                                                {/* Only show delete for regular users */}
                                                {user.role !== 'admin' && user._id !== currentUser?._id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm font-bold hover:bg-red-500/30 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1d23] rounded-2xl p-8 max-w-md w-full border border-[#FE9A00]/20"
                        >
                            <h2 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Create New User
                            </h2>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#FE9A00] mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#FE9A00] mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#FE9A00] mb-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-[#0f1115] text-white rounded-lg font-bold hover:bg-[#2d3139] transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black rounded-lg font-bold hover:shadow-lg transition"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Progress Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1d23] rounded-2xl p-8 max-w-2xl w-full border border-[#FE9A00]/20 max-h-[80vh] overflow-y-auto"
                        >
                            <h2 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {selectedUser.user.name}'s Progress
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/40 p-4 rounded-xl">
                                    <p className="text-sm text-[#6b7280] mb-1">Total Sessions</p>
                                    <p className="text-3xl font-black text-[#FE9A00]">{selectedUser.stats.totalSessions}</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl">
                                    <p className="text-sm text-[#6b7280] mb-1">Total Calories</p>
                                    <p className="text-3xl font-black text-[#FE9A00]">{selectedUser.stats.totalCalories}</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Recent Sessions</h3>
                            <div className="space-y-3">
                                {selectedUser.sessions.map((session) => (
                                    <div key={session._id} className="bg-black/40 p-4 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">{new Date(session.date).toLocaleDateString()}</p>
                                                <p className="text-sm text-[#6b7280]">{session.exercises?.length || 0} exercises</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#FE9A00] font-bold">{session.calories || 0} cal</p>
                                                <p className="text-sm text-[#6b7280]">{session.durationMin || 0} min</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full mt-6 px-6 py-3 bg-[#0f1115] text-white rounded-lg font-bold hover:bg-[#2d3139] transition"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
