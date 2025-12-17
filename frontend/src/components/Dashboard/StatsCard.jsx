import React from 'react';

function StatsCard({ title, value, icon, color, trend, subtitle, progress, maxValue }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  const progressColor = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  // Calculate progress percentage if progress and maxValue are provided
  const progressPercent = progress && maxValue ? Math.min((progress / maxValue) * 100, 100) : null;

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex-shrink-0 rounded-xl p-3 ${colorClasses[color]} shadow-md`}>
            <span className="text-3xl">{icon}</span>
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                trend === 'up' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {trend === 'up' ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Good
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Needs Work
                </>
              )}
            </div>
          )}
        </div>
        <dl>
          <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </dt>
          <dd className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {value}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
          </dd>
        </dl>
        {progressPercent !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${progressColor[color]} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;