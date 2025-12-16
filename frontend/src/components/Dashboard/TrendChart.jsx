import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="withAgenda" fill="#10b981" name="With Agenda" />
        <Bar dataKey="withoutAgenda" fill="#ef4444" name="Without Agenda" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TrendChart;