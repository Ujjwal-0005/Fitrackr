import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";

const WeeklyChart = ({ data }) => {
  // Handle non-array data (API error responses, null, etc.)
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p className="text-[#6b7280] text-center py-12">No workout data this week.</p>;
  }

  // Transform data to use correct field names from backend
  // Backend returns: { _id: "2025-01-20", calories: 350, duration: 45 }
  const chartData = data.map(item => ({
    date: item._id || item.date,  // Backend uses _id for date
    calories: item.calories || 0,
    duration: item.duration || 0
  }));

  console.log("WeeklyChart transformed data:", chartData);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
          barSize={60}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1d23" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1d23',
              border: '2px solid #FE9A00',
              borderRadius: '8px',
              color: '#EEEEEE',
              fontFamily: "'Inter', sans-serif",
              padding: '12px'
            }}
            labelStyle={{ color: '#FE9A00', fontWeight: 'bold', marginBottom: '8px' }}
            cursor={{ fill: 'rgba(254, 154, 0, 0.15)' }}
          />
          <Bar
            dataKey="calories"
            fill="#FE9A00"
            radius={[8, 8, 0, 0]}
            stroke="#FFA500"
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={800}
          >
            <LabelList
              dataKey="calories"
              position="top"
              style={{
                fill: '#EEEEEE',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: "'JetBrains Mono', monospace"
              }}
              formatter={(value) => `${Math.round(value)} kcal`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
