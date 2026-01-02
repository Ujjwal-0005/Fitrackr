import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getUserSessions } from "../api/sessions";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // ✅ Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getUserSessions();
        const eventData = res.data.map((s) => ({
          id: s._id,
          title: `${s.calories || 0} kcal`,
          start: new Date(s.date),
          end: new Date(s.date),
          allDay: true,
          session: s,
        }));
        setEvents(eventData);
        toast.success("📅 Sessions loaded successfully!");
      } catch (err) {
        console.error("Error fetching sessions:", err);
        toast.error("❌ Failed to load sessions");
      }
    };
    fetchSessions();
  }, []);

  // ✅ Better, more distinct event colors
  const eventStyleGetter = useCallback((event) => {
    const calories = event.session.calories || 0;
    let bg = "#333"; // default gray (no activity)
    if (calories > 500) bg = "#fd0d0d"; // 🔥 intense - bright yellow
    else if (calories > 300) bg = "#F59E0B"; // 🟧 moderate - amber orange
    else if (calories > 100) bg = "#10B981"; // 🟩 light - green

    return {
      style: {
        backgroundColor: bg,
        color: "#000",
        borderRadius: "8px",
        border: "none",
        fontWeight: "600",
      },
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#EEEEEE] p-6">
      {/* === Header === */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-extrabold tracking-wide text-white">
          📅 My Workout Calendar
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-[#FE9A00] to-[#FFA500] text-black font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition"
        >
          ← Back to Dashboard
        </button>
      </motion.div>

      {/* === Calendar === */}
      <motion.div
        className="bg-[#1a1d23] rounded-xl shadow-lg border border-[#FE9A00]/20 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={{
            month: true,
            week: true,
            day: true,
            agenda: true,
          }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedSession(event.session)}
          popup
        />
      </motion.div>

      {/* === Session Detail Modal === */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <motion.div
            className="bg-[#1a1d23] p-6 rounded-lg shadow-2xl max-w-md w-full relative border border-[#FE9A00]/40"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-2 right-2 text-[#FE9A00] hover:text-white"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold text-[#FE9A00] mb-2">
              Workout on {format(new Date(selectedSession.date), "MMMM do, yyyy")}
            </h2>
            <p className="text-[#FFA500] mb-2">
              🔥 Calories: {selectedSession.calories || "N/A"}
            </p>
            <p className="text-[#FFA500] mb-3">
              ⏱ Status: {selectedSession.status}
            </p>
            <ul className="text-sm text-[#EEEEEE] space-y-1 mb-4">
              {selectedSession.exercises?.map((ex, i) => (
                <li key={i}>
                  • {ex.nameSnapshot || "Exercise"} — {ex.sets?.length || 0} sets
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* === Legend === */}
      <motion.div
        className="flex justify-center mt-8 space-x-6 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#10B981] rounded"></div>
          <span>Light</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#fd0d0d] rounded"></div>
          <span>Intense</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
