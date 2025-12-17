import React, { useState } from 'react';

function CalendarHeatmap({ heatmapData, maxCount, totalMeetings }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get color intensity based on count
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.2) return 'bg-blue-200';
    if (intensity < 0.4) return 'bg-blue-300';
    if (intensity < 0.6) return 'bg-blue-400';
    if (intensity < 0.8) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  // Get cell data for a specific day and hour
  const getCellData = (day, hour) => {
    return heatmapData.find(d => d.day === day && d.hour === hour) || { count: 0, meetings: [] };
  };

  // Format hour for display
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Meeting Density Heatmap</h2>
        <p className="text-sm text-gray-600 mt-1">
          Visualize when meetings occur throughout the week. Darker colors indicate more meetings.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header with day labels */}
          <div className="flex mb-2">
            <div className="w-16 flex-shrink-0"></div>
            {days.map((day, idx) => (
              <div key={day} className="flex-1 text-center text-xs font-medium text-gray-600">
                {dayLabels[idx]}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {hours.map(hour => (
              <div key={hour} className="flex items-center">
                {/* Hour label */}
                <div className="w-16 flex-shrink-0 text-xs text-gray-600 text-right pr-2">
                  {formatHour(hour)}
                </div>

                {/* Day cells */}
                <div className="flex-1 flex gap-1">
                  {days.map(day => {
                    const cellData = getCellData(day, hour);
                    const cellKey = `${day}-${hour}`;
                    const isHovered = hoveredCell === cellKey;

                    return (
                      <div
                        key={cellKey}
                        className={`flex-1 h-8 rounded ${getColor(cellData.count)} transition-all cursor-pointer ${
                          isHovered ? 'ring-2 ring-blue-600 ring-offset-1 scale-105' : ''
                        }`}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${day} ${formatHour(hour)}: ${cellData.count} meeting${cellData.count !== 1 ? 's' : ''}`}
                      >
                        {cellData.count > 0 && (
                          <div className="h-full flex items-center justify-center text-xs font-semibold text-white">
                            {cellData.count}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
          </div>
          <span className="text-sm text-gray-600">More</span>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{totalMeetings}</span> meetings
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (() => {
        const [day, hour] = hoveredCell.split('-');
        const cellData = getCellData(day, parseInt(hour));
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-semibold text-gray-900 mb-2">
              {day} {formatHour(parseInt(hour))}
            </div>
            <div className="text-sm text-gray-700">
              <div className="mb-1">
                <span className="font-medium">{cellData.count}</span> meeting{cellData.count !== 1 ? 's' : ''}
              </div>
              {cellData.meetings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {cellData.meetings.slice(0, 3).map((meeting, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      • {meeting.title} ({meeting.duration} min, {meeting.attendees} attendees)
                    </div>
                  ))}
                  {cellData.meetings.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{cellData.meetings.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default CalendarHeatmap;

