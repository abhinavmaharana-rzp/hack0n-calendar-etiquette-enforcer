import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../utils/api';
import StatsCard from '../components/Dashboard/StatsCard';
import TrendChart from '../components/Dashboard/TrendChart';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading stats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => loadStats()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of meeting etiquette at Razorpay
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Last updated</p>
          <p className="font-medium">{lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Meetings"
          value={stats.overall.totalMeetings}
          icon="📅"
          color="blue"
          subtitle="This month"
        />
        <StatsCard
          title="With Agenda"
          value={`${stats.overall.agendaPercent}%`}
          icon="📋"
          color="green"
          trend={stats.overall.agendaPercent > 80 ? 'up' : 'down'}
          subtitle={`${stats.overall.meetingsWithAgenda} meetings`}
        />
        <StatsCard
          title="RSVP Rate"
          value={`${stats.overall.rsvpRate}%`}
          icon="✅"
          color="purple"
          trend={stats.overall.rsvpRate > 70 ? 'up' : 'down'}
          subtitle={`${stats.overall.totalResponded}/${stats.overall.totalAttendees} responded`}
        />
        <StatsCard
          title="Auto-Cancelled"
          value={stats.overall.autoCancelled}
          icon="❌"
          color="red"
          subtitle="No RSVPs received"
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            📊 Weekly Agenda Trends
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-600">With Agenda</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-gray-600">Without Agenda</span>
            </div>
          </div>
        </div>
        <TrendChart data={stats.weeklyData} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              🏆 Top Calendar Citizens
            </h3>
            <Link
              to="/leaderboard"
              className="text-sm text-primary hover:text-blue-700 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.leaderboard.slice(0, 5).map((user, index) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-600' :
                    'text-gray-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <div className="flex space-x-1 mt-1">
                      {user.badges.map((badge) => (
                        <span key={badge} className="text-lg" title={badge}>
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
                    A:{user.agendaScore} R:{user.rsvpScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Efficiency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚡ Meeting Efficiency Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average Duration</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.efficiency.avgDuration} min
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Good RSVP Rate (80%+)</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.efficiency.goodRSVPPercent}%
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Well-Planned Meetings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.efficiency.meetingsWithGoodRSVP}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to improve meeting hygiene?</h3>
            <p className="text-blue-100">
              Install the Google Calendar add-on and start enforcing agendas today!
            </p>
          </div>
          <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Started
          </button>
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