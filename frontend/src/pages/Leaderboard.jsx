import React, { useState, useEffect } from 'react';
import { getLeaderboard, getBadges } from '../utils/api';
import Toast from '../components/Toast';
import Tooltip from '../components/Tooltip';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('overall'); // overall, agenda, rsvp, ghost
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

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
      setUsers(leaderboardData.leaderboard || []);
      setBadges(badgesData.badges || {});
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      // Show empty state on error
      setUsers([]);
      setBadges({});
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'agenda':
        return b.agendaScore - a.agendaScore;
      case 'rsvp':
        return b.rsvpScore - a.rsvpScore;
      case 'ghost':
        return a.ghostScore - b.ghostScore; // Lower is better
      case 'overall':
      default:
        return b.overallScore - a.overallScore;
    }
  });

  const filteredUsers = sortedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const exportLeaderboard = () => {
    const csv = [
      ['Rank', 'Name', 'Email', 'Overall Score', 'Agenda Score', 'RSVP Score', 'Ghost Score', 'Badges'].join(','),
      ...filteredUsers.map((user, index) => [
        index + 1,
        user.name,
        user.email,
        user.overallScore,
        user.agendaScore,
        user.rsvpScore,
        user.ghostScore,
        user.badges.join(';')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setToast({ message: 'Leaderboard exported successfully!', type: 'success' });
  };

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
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            🏆 Leaderboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Top calendar citizens at Razorpay
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <RefreshButton onRefresh={loadData} isLoading={loading} />
          {filteredUsers.length > 0 && (
            <Tooltip text="Export leaderboard data to CSV">
              <button
                onClick={exportLeaderboard}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('overall')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'overall'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overall
            </button>
            <button
              onClick={() => setSortBy('agenda')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'agenda'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setSortBy('rsvp')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'rsvp'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              RSVP
            </button>
          </div>
        </div>
      </div>

      {/* Badge Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Badge Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(badges).map(([key, badge]) => (
            <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-3xl">{badge.emoji}</span>
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
        <div className="overflow-x-auto">
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
                  Agenda
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RSVP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.email}
                  className={`${
                    index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`text-xl font-bold ${
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
                      {index < 3 && (
                        <span className="ml-2 text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {user.badges.map((badgeType) => {
                        const badge = badges[badgeType];
                        return badge ? (
                          <span
                            key={badgeType}
                            className="text-2xl cursor-help"
                            title={badge.description}
                          >
                            {badge.emoji}
                          </span>
                        ) : null;
                      })}
                      {user.badges.length === 0 && (
                        <span className="text-gray-400 text-sm">No badges</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.agendaScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {user.rsvpScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      user.ghostScore > 5
                        ? 'bg-red-100 text-red-800'
                        : user.ghostScore > 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.ghostScore}
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {user.overallScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <p className="text-gray-500">No users found matching your search.</p>
            ) : (
              <EmptyState
                icon="🏆"
                title="No leaderboard data yet"
                message="Load demo data to see the leaderboard in action!"
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
        )}
      </div>
    </div>
  );
}

export default Leaderboard;