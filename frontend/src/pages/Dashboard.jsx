import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../utils/api';
import StatsCard from '../components/Dashboard/StatsCard';
import TrendChart from '../components/Dashboard/TrendChart';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading stats:', err);
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of meeting etiquette at Razorpay
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Meetings"
          value={stats.overall.totalMeetings}
          icon="📅"
          color="blue"
        />
        <StatsCard
          title="With Agenda"
          value={`${stats.overall.agendaPercent}%`}
          icon="📋"
          color="green"
          trend={stats.overall.agendaPercent > 80 ? 'up' : 'down'}
        />
        <StatsCard
          title="RSVP Rate"
          value={`${stats.overall.rsvpRate}%`}
          icon="✅"
          color="purple"
          trend={stats.overall.rsvpRate > 70 ? 'up' : 'down'}
        />
        <StatsCard
          title="Auto-Cancelled"
          value={stats.overall.autoCancelled}
          icon="❌"
          color="red"
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Weekly Agenda Trends
        </h3>
        <TrendChart data={stats.weeklyData} />
      </div>

      {/* Top Performers Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            🏆 Top Calendar Citizens
          </h3>
          
            href="/leaderboard"
            className="text-sm text-primary hover:text-blue-700 font-medium"
          >
            View Full Leaderboard →
          </a>
        </div>
        <div className="space-y-3">
          {stats.leaderboard.slice(0, 5).map((user, index) => (
            <div
              key={user.email}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-400">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <div className="flex space-x-2 mt-1">
                    {user.badges.map((badge) => (
                      <span key={badge} className="text-lg">
                        {getBadgeEmoji(badge)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Score: {user.overallScore}
                </p>
                <p className="text-xs text-gray-500">
                  Agenda: {user.agendaScore} | RSVP: {user.rsvpScore}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Efficiency */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Meeting Efficiency Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {stats.efficiency.avgDuration}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Duration (min)</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {stats.efficiency.goodRSVPPercent}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Good RSVP Rate (80%+)</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {stats.efficiency.meetingsWithGoodRSVP}
            </p>
            <p className="text-sm text-gray-600 mt-1">Well-Planned Meetings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBadgeEmoji(badgeType) {
  const badges = {
    'agenda-ninja': '🥷',
    'rsvp-champion': '⚡',
    'serial-ghost': '👻',
    'meeting-monk': '🧘',
    'streak-master': '🔥',
    'punctuality-pro': '⏰'
  };
  return badges[badgeType] || '⭐';
}

export default Dashboard;