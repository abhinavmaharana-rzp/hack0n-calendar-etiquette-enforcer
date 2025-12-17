import React, { useState, useEffect } from 'react';
import { getTeamComparison } from '../utils/api';
import Toast from '../components/Toast';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [avgSalary, setAvgSalary] = useState(100000);
  const [sortBy, setSortBy] = useState('overallScore');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadTeams();
  }, [avgSalary]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeamComparison(avgSalary);
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error loading teams:', err);
      setToast({ message: 'Failed to load team data', type: 'error' });
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Prepare chart data
  const chartData = sortedTeams.map(team => ({
    name: team.department.length > 15 ? team.department.substring(0, 15) + '...' : team.department,
    'Agenda Score': team.avgAgendaScore,
    'RSVP Score': team.avgRSVPScore,
    'Overall Score': team.overallScore
  }));

  const costChartData = sortedTeams.map(team => ({
    name: team.department.length > 15 ? team.department.substring(0, 15) + '...' : team.department,
    'Total Cost': team.totalCost,
    'Avg per Meeting': team.avgCostPerMeeting
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No Team Data Available"
        message="Team comparison data will appear once departments are assigned to users."
        actionLabel="Refresh"
        onAction={loadTeams}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Comparison</h1>
          <p className="text-gray-600 mt-1">Compare departments on meeting etiquette metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Avg Salary:</label>
            <input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(parseFloat(e.target.value) || 100000)}
              className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm"
              min="50000"
              max="500000"
              step="10000"
            />
            <span className="text-sm text-gray-500">/year</span>
          </div>
          <RefreshButton onRefresh={loadTeams} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Teams</div>
          <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Best Team</div>
          <div className="text-xl font-bold text-primary">
            {sortedTeams[0]?.department || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Score: {sortedTeams[0]?.overallScore || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Avg Agenda Compliance</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(teams.reduce((sum, t) => sum + t.agendaCompliance, 0) / teams.length)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Meeting Cost</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(teams.reduce((sum, t) => sum + t.totalCost, 0))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Scores Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Agenda Score" fill="#10b981" />
              <Bar dataKey="RSVP Score" fill="#8b5cf6" />
              <Bar dataKey="Overall Score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Costs by Team</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Total Cost" fill="#ef4444" />
              <Bar dataKey="Avg per Meeting" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Comparison Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Team Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}>
                  Team {sortBy === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('overallScore')}>
                  Overall Score {sortBy === 'overallScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('agendaCompliance')}>
                  Agenda % {sortBy === 'agendaCompliance' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rsvpRate')}>
                  RSVP % {sortBy === 'rsvpRate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('avgDuration')}>
                  Avg Duration {sortBy === 'avgDuration' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('meetingFrequency')}>
                  Meetings {sortBy === 'meetingFrequency' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalCost')}>
                  Total Cost {sortBy === 'totalCost' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTeams.map((team, index) => (
                <tr key={team.department} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold mr-2 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-600' :
                        'text-gray-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.department}</div>
                        <div className="text-xs text-gray-500">{team.totalUsers} users</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      team.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                      team.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {team.overallScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {team.agendaCompliance}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {team.rsvpRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {team.avgDuration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {team.meetingFrequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(team.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default Teams;

