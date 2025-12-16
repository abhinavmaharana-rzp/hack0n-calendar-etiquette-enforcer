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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📊 Analytics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deep dive into meeting room usage and efficiency
        </p>
      </div>

      {/* Room Usage Stats */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            🏢 Meeting Room Efficiency
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Room
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Auto-Cancelled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {room.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                      {room.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      {room.autoCancelled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;