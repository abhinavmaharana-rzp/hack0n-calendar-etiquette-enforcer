import React from 'react';

function InsightsCard({ insights }) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type) => {
    const icons = {
      success: '🎉',
      warning: '⚠️',
      info: '💡',
      tip: '💡'
    };
    return icons[type] || icons.info;
  };

  const getInsightColor = (type) => {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      tip: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Insights & Recommendations
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start">
              <span className="text-xl mr-3">{getInsightIcon(insight.type)}</span>
              <div className="flex-1">
                <p className="font-medium mb-1">{insight.title}</p>
                <p className="text-sm opacity-90">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InsightsCard;

