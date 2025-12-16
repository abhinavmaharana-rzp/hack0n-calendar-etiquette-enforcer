import React, { useState, useEffect } from 'react';
import { getUserStats } from '../utils/api';

function MyStats() {
  const [stats, setStats] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    // Get user email from localStorage or prompt
    const email = localStorage.getItem('userEmail') || prompt('Enter your email:');
    if (email) {
      setUserEmail(email);
      loadUserStats(email);
    }
  }, []);
  
  const loadUserStats = async (email) => {
    try {
      const data = await getUserStats(email);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personal Score Card */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Your Calendar Citizenship</h2>
        <div className="text-5xl font-bold mb-4">
          {Math.round(
            (stats.agendaScore * 0.3) +
            (stats.rsvpScore * 0.4) +
            ((100 - stats.ghostScore) * 0.3)
          )}
        </div>
        <p className="text-blue-100">Overall Score</p>
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Agenda Score"
          value={stats.agendaScore}
          max={100}
          icon="📋"
          color="green"
        />
        <StatCard
          title="RSVP Score"
          value={stats.rsvpScore}
          max={100}
          icon="✅"
          color="purple"
        />
        <StatCard
          title="Ghost Score"
          value={stats.ghostScore}
          max={100}
          icon="👻"
          color="red"
          lowerIsBetter
        />
      </div>
      
      {/* Badges */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">🏆 Your Badges</h3>
        <div className="flex flex-wrap gap-4">
          {stats.badges.map(badge => (
            <div key={badge.type} className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-2xl">{getBadgeEmoji(badge.type)}</span>
              <span className="font-medium">{getBadgeName(badge.type)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Improvement Suggestions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          💡 How to Improve
        </h3>
        <ul className="space-y-2 text-yellow-800">
          {generateSuggestions(stats).map((suggestion, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function generateSuggestions(stats) {
  const suggestions = [];
  
  if (stats.agendaScore < 10) {
    suggestions.push('Create more meetings with clear agendas to boost your Agenda Score');
  }
  
  if (stats.rsvpScore < 10) {
    suggestions.push('Respond to meeting invites within 24 hours to improve RSVP Score');
  }
  
  if (stats.ghostScore > 5) {
    suggestions.push('Check your Slack for pending RSVP reminders to reduce Ghost Score');
  }
  
  if (stats.currentRSVPStreak < 5) {
    suggestions.push('Build an RSVP streak by responding consistently to earn the Streak Master badge');
  }
  
  return suggestions;
}

export default MyStats;