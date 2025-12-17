import React, { useState } from 'react';
import Toast from '../components/Toast';

function Settings() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    theme: 'light',
    email: localStorage.getItem('userEmail') || ''
  });
  const [toast, setToast] = useState(null);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    if (settings.email) {
      localStorage.setItem('userEmail', settings.email);
    }
    setToast({ message: 'Settings saved successfully!', type: 'success' });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          ⚙️ Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize your Calendar Etiquette Enforcer experience
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* User Profile */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="your.email@razorpay.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used to track your personal stats and badges
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto-refresh Dashboard
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically refresh data every {settings.refreshInterval} seconds
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Refresh Interval */}
            {settings.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="10"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Notifications
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Receive notifications for badges, reminders, and updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            💾 Save Settings
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Built for:</strong> Razorpay</p>
          <p><strong>Purpose:</strong> Improving meeting hygiene through automation and gamification</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;

