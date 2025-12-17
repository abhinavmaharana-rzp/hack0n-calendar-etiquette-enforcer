import React from 'react';

function EmptyState({ 
  icon = '📅', 
  title, 
  message, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction 
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-12 text-center border-2 border-blue-200 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4 animate-bounce">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAction && (
            <button
              onClick={onAction}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {actionLabel || 'Get Started'}
            </button>
          )}
          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg border-2 border-primary"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

