import React, { useState } from 'react';

function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 z-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📚 Help & Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⌨️ Keyboard Shortcuts</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Navigate to Dashboard</span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Alt + 1</kbd>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Navigate to Leaderboard</span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Alt + 2</kbd>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Navigate to Analytics</span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Alt + 3</kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Click the refresh button to manually update data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Hover over badges to see descriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Export leaderboard data as CSV for analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check notifications for important updates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🥷</div>
                  <div className="text-sm font-medium text-gray-900">Agenda Ninja</div>
                  <div className="text-xs text-gray-600">10+ meetings with agendas</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-sm font-medium text-gray-900">RSVP Champion</div>
                  <div className="text-xs text-gray-600">20+ timely RSVPs</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-sm font-medium text-gray-900">Streak Master</div>
                  <div className="text-xs text-gray-600">10+ day RSVP streak</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">🧘</div>
                  <div className="text-sm font-medium text-gray-900">Meeting Monk</div>
                  <div className="text-xs text-gray-600">Overall excellence</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;

