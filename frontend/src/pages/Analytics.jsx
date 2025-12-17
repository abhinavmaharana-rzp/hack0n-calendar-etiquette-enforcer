import React, { useState, useEffect } from 'react';
import { getRoomStats, getHeatmapData } from '../utils/api';
import Toast from '../components/Toast';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';
import CalendarHeatmap from '../components/Analytics/CalendarHeatmap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function Analytics() {
  const [roomStats, setRoomStats] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomData, heatmap] = await Promise.all([
        getRoomStats(),
        getHeatmapData()
      ]);
      setRoomStats(roomData.roomStats || []);
      setHeatmapData(heatmap);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setRoomStats([]);
      setHeatmapData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare data for charts
  const roomEfficiencyData = roomStats.map(room => ({
    name: room._id.length > 20 ? room._id.substring(0, 20) + '...' : room._id,
    efficiency: Math.round((room.completed / room.totalBookings) * 100),
    total: room.totalBookings,
    completed: room.completed,
    cancelled: room.autoCancelled
  }));

  const pieData = [
    { name: 'Completed', value: roomStats.reduce((sum, r) => sum + r.completed, 0) },
    { name: 'Auto-Cancelled', value: roomStats.reduce((sum, r) => sum + r.autoCancelled, 0) }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📊 Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Deep dive into meeting room usage and efficiency
          </p>
        </div>
        <RefreshButton onRefresh={loadData} isLoading={loading} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {roomStats.length}
              </p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {roomStats.reduce((sum, room) => sum + room.totalBookings, 0)}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {roomStats.length > 0
                  ? Math.round(
                      roomStats.reduce((sum, room) => {
                        const efficiency = (room.completed / room.totalBookings) * 100;
                        return sum + efficiency;
                      }, 0) / roomStats.length
                    )
                  : 0}%
              </p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      {heatmapData && (
        <CalendarHeatmap
          heatmapData={heatmapData.heatmapData}
          maxCount={heatmapData.maxCount}
          totalMeetings={heatmapData.totalMeetings}
        />
      )}

      {/* Charts Section */}
      {roomStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Efficiency Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Room Efficiency by Usage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="efficiency" fill="#8b5cf6" name="Efficiency %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Meeting Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Meeting Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Room Usage Stats Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            🏢 Meeting Room Efficiency
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Track which rooms are being used effectively
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-Cancelled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomStats.map((room) => {
                const efficiency = Math.round(
                  (room.completed / room.totalBookings) * 100
                );
                return (
                  <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏢</span>
                        <div className="text-sm font-medium text-gray-900">
                          {room._id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      {room.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {room.completed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {room.autoCancelled}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              efficiency >= 80
                                ? 'bg-green-500'
                                : efficiency >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${efficiency}%` }}
                          ></div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            efficiency >= 80
                              ? 'bg-green-100 text-green-800'
                              : efficiency >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {efficiency}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {roomStats.length === 0 && (
          <EmptyState
            icon="🏢"
            title="No room data available yet"
            message="Data will appear once meetings with room locations are created."
            actionLabel="🚀 Load Demo Data"
            onAction={async () => {
              try {
                const response = await fetch('http://localhost:5000/api/demo/seed', { method: 'POST' });
                if (response.ok) {
                  setToast({ message: 'Demo data loaded successfully!', type: 'success' });
                  loadData();
                } else {
                  setToast({ message: 'Failed to load demo data', type: 'error' });
                }
              } catch (err) {
                setToast({ message: 'Error loading demo data', type: 'error' });
                console.error(err);
              }
            }}
          />
        )}
      </div>

      {/* Insights */}
      {roomStats.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">💡 Insights</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                {roomStats.filter(r => (r.completed / r.totalBookings) * 100 < 60).length} rooms
                have efficiency below 60%
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                {roomStats.reduce((sum, room) => sum + room.autoCancelled, 0)} meetings were
                auto-cancelled due to no RSVPs
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Consider implementing stricter RSVP policies for rooms with low efficiency
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Analytics;