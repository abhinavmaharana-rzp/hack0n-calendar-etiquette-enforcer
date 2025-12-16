import React, { useState, useEffect } from 'react';
import { getLeaderboard, getBadges } from '../utils/api';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, badgesData] = await Promise.all([
        getLeaderboard(50),
        getBadges()
      ]);
      setUsers(leaderboardData.leaderboard);
      setBadges(badgesData.badges);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
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
        <h2 className="text-3xl font-bold text-gray-900">🏆 Leaderboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Top calendar citizens at Razorpay
        </p>
      </div>

      {/* Badge Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Badge Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(badges).map(([key, badge]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="text-2xl">{badge.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Badges
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agenda Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                RSVP Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghost Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overall
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr
                key={user.email}
                className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-lg font-bold ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : index === 2
                        ? 'text-orange-600'
                        : 'text-gray-600'
                    }`}
                  >
                    #{index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {user.badges.map((badgeType) => {
                      const badge = badges[badgeType];
                      return badge ? (
                        <span
                          key={badgeType}
                          className="text-xl"
                          title={badge.description}
                        >
                          {badge.emoji}
                        </span>
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.agendaScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.rsvpScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span
                    className={
                      user.ghostScore > 5 ? 'text-red-600' : 'text-gray-900'
                    }
                  >
                    {user.ghostScore}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                  {user.overallScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;