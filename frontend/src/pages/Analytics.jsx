import React, { useState, useEffect } from 'react';
import { getRoomStats } from '../utils/api';

function Analytics() {
  const [roomStats, setRoomStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoomStats();
  }, []);

  const loadRoomStats = async () => {
    try {
      setLoading(true);
      const data = await getRoomStats();
      setRoomStats(data.roomStats);
    } catch (err) {
      console.error('Error loading room stats:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📊 Analytics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deep dive into meeting room usage and efficiency
        </p>
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

      {/* Room Usage Stats Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-500">No room data available yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Data will appear once meetings with room locations are created.
            </p>
          </div>
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