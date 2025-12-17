import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../utils/api';
import StatsCard from '../components/Dashboard/StatsCard';
import TrendChart from '../components/Dashboard/TrendChart';
import InsightsCard from '../components/InsightsCard';
import Toast from '../components/Toast';
import Tooltip from '../components/Tooltip';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';
import AgendaSuggestions from '../components/AgendaSuggestions';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toast, setToast] = useState(null);

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
      if (!silent && data) {
        setToast({ message: 'Dashboard updated successfully!', type: 'success' });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading stats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-16 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-8 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => loadStats()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-md"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  fetch('http://localhost:5000/api/demo/seed', { method: 'POST' })
                    .then(() => loadStats())
                    .catch(console.error);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Load Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!stats || (stats.overall.totalMeetings === 0 && stats.leaderboard.length === 0)) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of meeting etiquette at Razorpay
            </p>
          </div>
        </div>
        
        <EmptyState
          icon="📅"
          title="Welcome to Calendar Etiquette Enforcer!"
          message="Get started by creating meetings with agendas or load demo data to see the dashboard in action."
          actionLabel="🚀 Load Demo Data"
          onAction={async () => {
            try {
              const response = await fetch('http://localhost:5000/api/demo/seed', { method: 'POST' });
              if (response.ok) {
                setToast({ message: 'Demo data loaded successfully!', type: 'success' });
                loadStats();
              } else {
                setToast({ message: 'Failed to load demo data', type: 'error' });
              }
            } catch (err) {
              setToast({ message: 'Error loading demo data', type: 'error' });
              console.error(err);
            }
          }}
          secondaryActionLabel="📋 Open Google Calendar"
          onSecondaryAction={() => window.open('https://calendar.google.com', '_blank')}
        />
      </div>
    );
  }

  // Generate insights based on stats
  const generateInsights = () => {
    if (!stats) return [];
    const insights = [];
    
    if (stats.overall.agendaPercent >= 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Agenda Compliance!',
        message: `${stats.overall.agendaPercent}% of meetings have agendas. Keep up the great work!`
      });
    } else if (stats.overall.agendaPercent < 70) {
      insights.push({
        type: 'warning',
        title: 'Agenda Compliance Needs Improvement',
        message: `Only ${stats.overall.agendaPercent}% of meetings have agendas. Encourage teams to use the agenda template.`
      });
    }
    
    if (stats.overall.rsvpRate >= 80) {
      insights.push({
        type: 'success',
        title: 'Great RSVP Response Rate!',
        message: `${stats.overall.rsvpRate}% RSVP rate shows good meeting engagement.`
      });
    } else if (stats.overall.rsvpRate < 60) {
      insights.push({
        type: 'warning',
        title: 'Low RSVP Response Rate',
        message: `RSVP rate is ${stats.overall.rsvpRate}%. Consider sending reminders earlier.`
      });
    }
    
    if (stats.overall.autoCancelled > 0) {
      insights.push({
        type: 'info',
        title: 'Smart Room Management',
        message: `${stats.overall.autoCancelled} meetings were auto-cancelled, saving valuable room resources.`
      });
    }
    
    if (stats.efficiency?.goodRSVPPercent >= 80) {
      insights.push({
        type: 'success',
        title: 'Highly Efficient Meetings',
        message: `${stats.efficiency.goodRSVPPercent}% of meetings have excellent RSVP rates.`
      });
    }
    
    return insights;
  };

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of meeting etiquette at Razorpay
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <RefreshButton onRefresh={() => loadStats()} isLoading={loading} />
          <div className="text-right">
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refresh: 30s</span>
            </div>
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="font-medium text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatsCard
          title="Total Meetings"
          value={stats.overall.totalMeetings || 0}
          icon="📅"
          color="blue"
          subtitle="This month"
        />
        <StatsCard
          title="With Agenda"
          value={`${stats.overall.agendaPercent || 0}%`}
          icon="📋"
          color="green"
          trend={stats.overall.agendaPercent > 80 ? 'up' : 'down'}
          subtitle={`${stats.overall.meetingsWithAgenda || 0} meetings`}
          progress={stats.overall.agendaPercent || 0}
          maxValue={100}
        />
        <StatsCard
          title="RSVP Rate"
          value={`${stats.overall.rsvpRate || 0}%`}
          icon="✅"
          color="purple"
          trend={stats.overall.rsvpRate > 70 ? 'up' : 'down'}
          subtitle={`${stats.overall.totalResponded || 0}/${stats.overall.totalAttendees || 0} responded`}
          progress={stats.overall.rsvpRate || 0}
          maxValue={100}
        />
        <StatsCard
          title="Auto-Cancelled"
          value={stats.overall.autoCancelled || 0}
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
        <TrendChart data={stats.weeklyData || []} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              🏆 Top Calendar Citizens
            </h3>
            <Tooltip text="View full leaderboard with all users">
              <Link
                to="/leaderboard"
                className="text-sm text-primary hover:text-blue-700 font-medium transition-colors inline-flex items-center"
              >
                View All →
              </Link>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {stats.leaderboard && stats.leaderboard.length > 0 ? stats.leaderboard.slice(0, 5).map((user, index) => (
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
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No leaderboard data yet</p>
              </div>
            )}
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
                  {stats.efficiency?.avgDuration || 0} min
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Good RSVP Rate (80%+)</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.efficiency?.goodRSVPPercent || 0}%
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Well-Planned Meetings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.efficiency?.meetingsWithGoodRSVP || 0}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <InsightsCard insights={generateInsights()} />

      {/* AI Agenda Suggestions */}
      <AgendaSuggestions />

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Ready to improve meeting hygiene?</h3>
            <p className="text-blue-100 text-lg">
              Install the Google Calendar add-on and start enforcing agendas today!
            </p>
          </div>
          <div className="flex space-x-3">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Get Started
            </a>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5000/api/demo/seed', { method: 'POST' });
                  if (response.ok) {
                    setToast({ message: 'Demo data loaded successfully!', type: 'success' });
                    loadStats();
                  }
                } catch (err) {
                  setToast({ message: 'Failed to load demo data', type: 'error' });
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
            >
              🚀 Load Demo
            </button>
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