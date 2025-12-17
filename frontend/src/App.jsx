import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CostCalculator from './pages/CostCalculator';
import Teams from './pages/Teams';
import NotificationCenter from './components/NotificationCenter';
import QuickStats from './components/QuickStats';
import Tooltip from './components/Tooltip';
import HelpModal from './components/HelpModal';
import ProtectedRoute from './components/ProtectedRoute';
import { getDashboardStats } from './utils/api';

function AppContent() {
  const location = useLocation();
  const [quickStats, setQuickStats] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    if (!isAuthenticated && location.pathname !== '/login') {
      window.location.href = '/login';
      return;
    }
  }, [location.pathname]);

  useEffect(() => {
    // Load quick stats for navigation
    getDashboardStats()
      .then(data => setQuickStats(data.overall))
      .catch(() => {});
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search if implemented
      }
      // Number keys for navigation
      if (e.altKey) {
        if (e.key === '1') {
          window.location.href = '/dashboard';
        } else if (e.key === '2') {
          window.location.href = '/leaderboard';
        } else if (e.key === '3') {
          window.location.href = '/analytics';
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex flex-1">
              {/* Logo */}
              <Link to="/dashboard" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
                <span className="text-3xl">📅</span>
                <h1 className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                  Calendar Etiquette Enforcer
                </h1>
                <h1 className="ml-3 text-xl font-bold text-gray-900 sm:hidden">
                  Cal Enforcer
                </h1>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4 lg:space-x-8 flex-nowrap items-center">
                <Tooltip text="Dashboard overview (Alt+1)">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </Tooltip>
                <Tooltip text="Leaderboard & rankings (Alt+2)">
                  <NavLink
                    to="/leaderboard"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Leaderboard
                  </NavLink>
                </Tooltip>
                <Tooltip text="Analytics & insights (Alt+3)">
                  <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Analytics
                  </NavLink>
                </Tooltip>
                <Tooltip text="Meeting cost calculator">
                  <NavLink
                    to="/cost-calculator"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Cost Calculator
                  </NavLink>
                </Tooltip>
                <Tooltip text="Team comparison">
                  <NavLink
                    to="/teams"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Teams
                  </NavLink>
                </Tooltip>
                <Tooltip text="Settings & preferences">
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    Settings
                  </NavLink>
                </Tooltip>
              </div>
            </div>

            {/* Right side - Quick Stats, Notifications, Status */}
            <div className="flex items-center space-x-4">
              <QuickStats stats={quickStats} />
              
              <NotificationCenter />
              
              <Tooltip text="System is live and running">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              </Tooltip>
              
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('is_authenticated');
                  window.location.href = '/';
                }}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Leaderboard
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Analytics
              </NavLink>
              <NavLink
                to="/cost-calculator"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Cost Calculator
              </NavLink>
              <NavLink
                to="/teams"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Teams
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`
                }
              >
                Settings
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link to="/dashboard" className="hover:text-gray-700">Home</Link>
                </li>
                {location.pathname !== '/dashboard' && location.pathname !== '/' && (
                  <>
                    <li>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </li>
                    <li className="text-gray-900 font-medium capitalize">
                      {location.pathname.substring(1)}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/cost-calculator" element={<ProtectedRoute><CostCalculator /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>

        {/* Help & Keyboard Shortcuts Button */}
        <div className="fixed bottom-4 right-4 z-40">
          <Tooltip text="Help & Keyboard Shortcuts" position="left">
            <button
              onClick={() => setShowHelp(true)}
              className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>
        </div>

        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  About
                </h3>
                <p className="text-sm text-gray-500">
                  Calendar Etiquette Enforcer improves meeting hygiene at Razorpay through automation, gamification, and smart insights.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>📋 Agenda Enforcement</li>
                  <li>📱 RSVP Reminders</li>
                  <li>🏆 Badge System</li>
                  <li>📊 Analytics Dashboard</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => setShowHelp(true)}
                      className="text-primary hover:text-blue-700 transition-colors"
                    >
                      Help & Shortcuts
                    </button>
                  </li>
                  <li>
                    <Link to="/settings" className="text-primary hover:text-blue-700 transition-colors">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-blue-700 transition-colors"
                    >
                      Google Calendar
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-500 text-center md:text-left">
                  Built with ❤️ for <span className="font-semibold text-primary">Razorpay Hack0n-05</span>
                </p>
                <div className="mt-4 md:mt-0 flex space-x-6">
                  <a href="https://github.com" className="text-gray-400 hover:text-gray-500 transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path 
                        fillRule="evenodd" 
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;