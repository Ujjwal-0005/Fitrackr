import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Icon from '../components/Icon';

const SessionDebug = () => {
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/smart-sessions/test/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDbStats(response.data);
      toast.success('Database stats loaded!');
    } catch (err) {
      toast.error('Failed to load stats: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FE9A00] mb-8">Session Debug Panel</h1>

        <button
          onClick={checkDatabase}
          disabled={loading}
          className="px-6 py-3 bg-[#FE9A00] text-black font-bold rounded-lg mb-8 hover:bg-[#FFA500] transition"
        >
          {loading ? 'Loading...' : 'Refresh Database Stats'}
        </button>

        {dbStats && (
          <div className="bg-[#1a1d23] rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f1115] p-6 rounded-xl">
                <div className="text-sm text-[#EEEEEE]/60 mb-2">Total Sessions</div>
                <div className="text-4xl font-bold text-[#FE9A00]">{dbStats.total}</div>
              </div>

              <div className="bg-[#0f1115] p-6 rounded-xl">
                <div className="text-sm text-[#EEEEEE]/60 mb-2">Completed</div>
                <div className="text-4xl font-bold text-[#00ff9c]">{dbStats.completed}</div>
              </div>

              <div className="bg-[#0f1115] p-6 rounded-xl">
                <div className="text-sm text-[#EEEEEE]/60 mb-2">In Progress</div>
                <div className="text-4xl font-bold text-[#fbbf24]">{dbStats.inProgress}</div>
              </div>
            </div>

            {dbStats.latest && (
              <div className="bg-[#0f1115] p-6 rounded-xl mt-6">
                <h3 className="text-xl font-bold text-[#FE9A00] mb-4">Latest Session</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div><span className="text-[#EEEEEE]/60">ID:</span> {dbStats.latest.id}</div>
                  <div><span className="text-[#EEEEEE]/60">Status:</span> <span className={`font-bold ${dbStats.latest.status === 'completed' ? 'text-[#00ff9c]' : 'text-[#fbbf24]'}`}>{dbStats.latest.status}</span></div>
                  <div><span className="text-[#EEEEEE]/60">Created:</span> {new Date(dbStats.latest.createdAt).toLocaleString()}</div>
                  <div><span className="text-[#EEEEEE]/60">Exercises:</span> {dbStats.latest.exercises}</div>
                  <div><span className="text-[#EEEEEE]/60">Volume:</span> {dbStats.latest.volume}kg</div>
                </div>
              </div>
            )}

            {dbStats.total === 0 && (
              <div className="bg-[#0f1115] p-6 rounded-xl mt-6 text-center">
                <div className="text-6xl mb-4"><Icon name="inbox" className="w-16 h-16 text-zinc-500" /></div>
                <div className="text-xl text-[#EEEEEE]/60">No sessions found in database</div>
                <div className="text-sm text-[#EEEEEE]/40 mt-2">Complete a workout to see data here</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-[#1a1d23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#FE9A00] mb-4">Troubleshooting Checklist</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#00ff9c]">✓</span>
              <span>Backend running on http://localhost:8080</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00ff9c]">✓</span>
              <span>Frontend connected to backend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={dbStats ? 'text-[#00ff9c]' : 'text-[#EEEEEE]/40'}>
                {dbStats ? '✓' : '○'}
              </span>
              <span>Database accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={dbStats?.total > 0 ? 'text-[#00ff9c]' : 'text-[#EEEEEE]/40'}>
                {dbStats?.total > 0 ? '✓' : '○'}
              </span>
              <span>Sessions exist in database</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-[#1a1d23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#FE9A00] mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#EEEEEE]/80">
            <li>Go to Workout Plans</li>
            <li>Select a plan and start a workout</li>
            <li>Complete at least one set</li>
            <li>End the workout</li>
            <li>Return here and refresh stats</li>
            <li>Check browser console (F12) for logs</li>
            <li>Check backend terminal for emoji logs (🔵🟡✅)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SessionDebug;
