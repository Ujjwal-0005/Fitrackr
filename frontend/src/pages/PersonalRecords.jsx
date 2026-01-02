import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PRCanvas from '../components/pr/PRCanvas';
import PRHero from '../components/pr/PRHero';
import PRCard from '../components/pr/PRCard';
import { getMyPRs, upsertPR, autoDetectPRs } from '../api/personalRecords';

const PersonalRecords = () => {
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    kind: 'strength',
    value: '',
    unit: 'kg'
  });
  const [stats, setStats] = useState({
    totalPRs: 0,
    strongestLift: { exercise: 'N/A', value: 0, unit: 'kg' },
    latestDate: null
  });

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      setLoading(true);
      const response = await getMyPRs();
      const prData = response.data || [];
      setPRs(prData);

      // Calculate stats
      if (prData.length > 0) {
        // Find strongest lift
        const strongest = prData.reduce((max, pr) =>
          pr.value > max.value ? pr : max
          , prData[0]);

        // Find latest date
        const latest = prData.reduce((newest, pr) =>
          new Date(pr.date) > new Date(newest.date) ? pr : newest
          , prData[0]);

        setStats({
          totalPRs: prData.length,
          strongestLift: {
            exercise: strongest.exercise,
            value: strongest.value,
            unit: strongest.unit || 'kg'
          },
          latestDate: latest.date
        });
      }
    } catch (error) {
      console.error('Failed to load PRs:', error);
      toast.error('Failed to load personal records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPR = async (e) => {
    e.preventDefault();
    try {
      await upsertPR(formData);
      toast.success('Personal Record saved!');
      setShowModal(false);
      setFormData({ name: '', kind: 'strength', value: '', unit: 'kg' });
      loadPRs();
    } catch (error) {
      console.error('Failed to save PR:', error);
      toast.error('Failed to save personal record');
    }
  };

  const handleAutoDetect = async () => {
    try {
      const response = await autoDetectPRs();
      toast.success(response.data.message);
      loadPRs();
    } catch (error) {
      console.error('Failed to auto-detect PRs:', error);
      toast.error('Failed to auto-detect PRs');
    }
  };

  // Determine card variants
  const getCardVariants = (pr, index) => {
    const isHighlight = pr.value === stats.strongestLift.value && pr.exercise === stats.strongestLift.exercise;
    const isNew = new Date(pr.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const isTrending = new Date(pr.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    return { isHighlight, isNew, isTrending: isTrending && !isNew };
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar />

      {/* Three.js Background */}
      <PRCanvas />

      {/* Hero Section */}
      <PRHero
        totalPRs={stats.totalPRs}
        strongestLift={stats.strongestLift}
        latestDate={stats.latestDate}
      />

      {/* PR Showcase Grid */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading State
            <div className="flex items-center justify-center py-20">
              <motion.div
                className="w-16 h-16 border-4 border-[#FE9A00] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : prs.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-[#1a1d23]/20 backdrop-blur-xl border border-[#FE9A00]/10 rounded-2xl"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                No Personal Records Yet
              </h3>
              <p className="text-[#a8adb3] text-lg">
                Start tracking your workouts to set your first PR!
              </p>
            </motion.div>
          ) : (
            // PR Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prs.map((pr, index) => {
                const variants = getCardVariants(pr, index);
                return (
                  <PRCard
                    key={pr._id || index}
                    pr={pr}
                    index={index}
                    {...variants}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {/* Auto-Detect Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAutoDetect}
          className="w-16 h-16 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] rounded-full shadow-2xl flex items-center justify-center text-2xl"
          title="Auto-detect PRs from sessions"
        >
          🔍
        </motion.button>

        {/* Add PR Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-16 h-16 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold text-black"
        >
          +
        </motion.button>
      </div>

      {/* Add PR Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1d23] rounded-2xl p-8 max-w-md w-full border border-[#FE9A00]/20"
          >
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Add Personal Record
            </h2>

            <form onSubmit={handleSubmitPR} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#FE9A00] mb-2">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                  placeholder="e.g., Bench Press"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#FE9A00] mb-2">Type</label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                >
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#FE9A00] mb-2">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#FE9A00] mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1115] border border-[#FE9A00]/30 rounded-lg text-white focus:outline-none focus:border-[#FE9A00]"
                  >
                    <option value="kg">kg</option>
                    <option value="reps">reps</option>
                    <option value="mins">mins</option>
                    <option value="km">km</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-[#0f1115] text-white rounded-lg font-bold hover:bg-[#2d3139] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black rounded-lg font-bold hover:shadow-lg transition"
                >
                  Save PR
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Floating gradient orbs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-[#FE9A00]/8 rounded-full blur-3xl"
          style={{ animation: "float 25s ease-in-out infinite", top: '10%', right: '5%' }}
        />
        <div
          className="absolute w-[700px] h-[700px] bg-[#FE9A00]/6 rounded-full blur-3xl"
          style={{ animation: "float 30s ease-in-out infinite 5s", bottom: '15%', left: '10%' }}
        />
      </div>

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalRecords;
