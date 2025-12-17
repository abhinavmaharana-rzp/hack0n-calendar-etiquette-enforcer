import React, { useState } from 'react';
import { suggestAgenda } from '../utils/api';
import Toast from './Toast';

function AgendaSuggestions() {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(5);
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const meetingTypes = [
    { value: '', label: 'Auto-detect' },
    { value: 'standup', label: 'Standup/Daily Sync' },
    { value: 'review', label: 'Review/Retrospective' },
    { value: 'planning', label: 'Planning' },
    { value: 'demo', label: 'Demo/Showcase' },
    { value: '1:1', label: '1:1 Meeting' },
    { value: 'all-hands', label: 'All-Hands/Town Hall' }
  ];

  const handleSuggest = async () => {
    if (!meetingTitle.trim()) {
      setToast({ message: 'Please enter a meeting title', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const data = await suggestAgenda(meetingTitle, attendeeCount, duration, meetingType || null);
      setSuggestions(data.suggestions);
      setToast({ message: 'Agenda suggestions generated!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate suggestions', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = () => {
    if (suggestions?.template) {
      navigator.clipboard.writeText(suggestions.template);
      setCopied(true);
      setToast({ message: 'Template copied to clipboard!', type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🤖 AI Agenda Suggestions
        </h2>
        <p className="text-gray-600 text-sm">
          Get intelligent agenda suggestions based on your meeting context
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Title *
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="e.g., Sprint Planning, Team Standup, Product Review"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSuggest()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendee Count
            </label>
            <input
              type="number"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 5)}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              min="15"
              max="240"
              step="15"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Type (optional)
          </label>
          <select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {meetingTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSuggest}
          disabled={loading || !meetingTitle.trim()}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Generating...' : '✨ Generate Suggestions'}
        </button>
      </div>

      {/* Suggestions Display */}
      {suggestions && (
        <div className="space-y-4 border-t pt-6">
          {/* Purpose Suggestions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📍</span> Purpose Suggestions
            </h3>
            <ul className="space-y-2">
              {suggestions.purpose.map((purpose, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{purpose}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outcomes */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">🎯</span> Expected Outcomes
            </h3>
            <ul className="space-y-2">
              {suggestions.outcomes.map((outcome, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Discussion Points */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">⚡</span> Discussion Points
            </h3>
            <ul className="space-y-2">
              {suggestions.discussionPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pre-reads */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📌</span> Pre-reads
            </h3>
            <ul className="space-y-2">
              {suggestions.prereads.map((preread, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{preread}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Template */}
          {suggestions.template && (
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">📋 Complete Template</h3>
                <button
                  onClick={handleCopyTemplate}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                {suggestions.template}
              </pre>
            </div>
          )}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default AgendaSuggestions;

