import React, { useState, useEffect } from 'react';
import { getCostAnalysis } from '../utils/api';
import Toast from '../components/Toast';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function CostCalculator() {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [avgSalary, setAvgSalary] = useState(100000);

  useEffect(() => {
    loadCostAnalysis();
  }, [avgSalary]);

  const loadCostAnalysis = async () => {
    try {
      setLoading(true);
      const data = await getCostAnalysis(avgSalary);
      setCostData(data);
    } catch (err) {
      console.error('Error loading cost analysis:', err);
      setToast({ message: 'Failed to load cost analysis', type: 'error' });
      setCostData(null);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!costData) {
    return (
      <EmptyState
        icon="💰"
        title="No Cost Data Available"
        message="No meeting data found to calculate costs."
        actionLabel="Refresh"
        onAction={loadCostAnalysis}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Cost Calculator</h1>
          <p className="text-gray-600 mt-1">Track and optimize your meeting expenses</p>
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
          <RefreshButton onRefresh={loadCostAnalysis} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90 mb-1">Total Meeting Cost</div>
          <div className="text-3xl font-bold">{formatCurrency(costData.totalCost)}</div>
          <div className="text-sm opacity-75 mt-2">
            {costData.totalMeetings} meetings
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90 mb-1">Savings from Cancellations</div>
          <div className="text-3xl font-bold">{formatCurrency(costData.savingsFromCancelled)}</div>
          <div className="text-sm opacity-75 mt-2">
            {costData.cancelledMeetings} cancelled
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90 mb-1">Avg Cost per Meeting</div>
          <div className="text-3xl font-bold">{formatCurrency(costData.avgCostPerMeeting)}</div>
          <div className="text-sm opacity-75 mt-2">
            {formatCurrency(costData.hourRate)}/hour rate
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90 mb-1">Efficiency Score</div>
          <div className="text-3xl font-bold">{costData.efficiencyScore}%</div>
          <div className="text-sm opacity-75 mt-2">
            {costData.totalAttendeeHours.toFixed(1)} attendee-hours
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cost Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Cost Trend</h2>
          {costData.monthlyData && costData.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Monthly Cost"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No monthly data available</div>
          )}
        </div>

        {/* Department Costs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost by Department</h2>
          {costData.departmentData && costData.departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="cost" fill="#8b5cf6" name="Total Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No department data available</div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-2">💰 Cost Efficiency</div>
            <p className="text-sm text-gray-600">
              Your organization spends {formatCurrency(costData.totalCost)} on meetings.
              {costData.efficiencyScore >= 80 && ' Great efficiency!'}
              {costData.efficiencyScore < 80 && costData.efficiencyScore >= 60 && ' Room for improvement.'}
              {costData.efficiencyScore < 60 && ' Consider optimizing meeting schedules.'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-2">💵 Savings Impact</div>
            <p className="text-sm text-gray-600">
              Auto-cancelled meetings saved {formatCurrency(costData.savingsFromCancelled)}.
              That's {((costData.savingsFromCancelled / costData.totalCost) * 100).toFixed(1)}% of total meeting costs.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-2">⏱️ Time Investment</div>
            <p className="text-sm text-gray-600">
              Total of {costData.totalAttendeeHours.toFixed(1)} attendee-hours spent in meetings.
              Average {costData.avgCostPerAttendeeHour.toFixed(2)} per attendee-hour.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-2">📊 Recommendations</div>
            <p className="text-sm text-gray-600">
              {costData.avgCostPerMeeting > 500 && 'Consider shorter meetings or fewer attendees.'}
              {costData.avgCostPerMeeting <= 500 && 'Meeting costs are well optimized.'}
              Focus on agenda quality to maximize ROI.
            </p>
          </div>
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

export default CostCalculator;

