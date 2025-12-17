import React from 'react';

function QuickStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="hidden lg:flex items-center space-x-6 text-sm">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-600">Agenda:</span>
        <span className="font-semibold text-gray-900">{stats.agendaPercent || 0}%</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span className="text-gray-600">RSVP:</span>
        <span className="font-semibold text-gray-900">{stats.rsvpRate || 0}%</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Meetings:</span>
        <span className="font-semibold text-gray-900">{stats.totalMeetings || 0}</span>
      </div>
    </div>
  );
}

export default QuickStats;

