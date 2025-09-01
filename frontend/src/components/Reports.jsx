import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChartIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CalendarIcon,
  BoxIcon
} from '@radix-ui/react-icons';
import PageHeader from './PageHeader';

// Get week number utility function
const getWeekNumber = (date) => {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};


const Reports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    week: getWeekNumber(new Date()),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    plateNumber: ''
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/reports/${reportType}`;
      const params = new URLSearchParams();

      switch (reportType) {
        case 'daily':
          if (filters.date) params.append('date', filters.date);
          break;
        case 'weekly':
          if (filters.week) params.append('week', filters.week);
          if (filters.year) params.append('year', filters.year);
          break;
        case 'monthly':
          if (filters.month) params.append('month', filters.month);
          if (filters.year) params.append('year', filters.year);
          break;
        case 'yearly':
          if (filters.year) params.append('year', filters.year);
          break;
        case 'car':
          if (filters.plateNumber) {
            url = `/api/reports/car/${encodeURIComponent(filters.plateNumber)}`;
          }
          break;
        default:
          break;
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setReportData(response.data);
    } catch (error) {
      toast.error('Error fetching report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [reportType, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const StatCard = ({ title, value, subtitle, color = 'blue', icon: Icon = PlusIcon, trend }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900 mt-1">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500 mt-1">{subtitle}</dd>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDailyReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Income"
          value={`$${reportData?.totalIncome || 0}`}
          color="green"
          icon={ArrowUpIcon}
        />
        <StatCard
          title="Total Expenses"
          value={`$${reportData?.totalExpenses || 0}`}
          color="red"
          icon={ArrowDownIcon}
        />
        <StatCard
          title="Net Profit"
          value={`$${reportData?.netProfit || 0}`}
          color={reportData?.netProfit >= 0 ? 'green' : 'red'}
          icon={PlusIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatCard
          title="Cars Rented"
          value={reportData?.carsRented || 0}
          color="blue"
          icon={BoxIcon}
        />
        <StatCard
          title="Repairs"
          value={reportData?.repairsCount || 0}
          color="yellow"
          icon={BarChartIcon}
        />
      </div>

      {reportData?.bookings?.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Today's Bookings</h3>
            <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {reportData.bookings.length} bookings
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Car</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.bookings.map((booking, index) => (
                  <tr key={booking._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{booking.plateNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">${booking.paymentAmount}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderWeeklyReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Income"
          value={`$${reportData?.totalIncome || 0}`}
          subtitle={`Week ${reportData?.week}, ${reportData?.year}`}
          color="green"
          icon={ArrowUpIcon}
        />
        <StatCard
          title="Total Expenses"
          value={`$${reportData?.totalExpenses || 0}`}
          color="red"
          icon={ArrowDownIcon}
        />
        <StatCard
          title="Net Profit"
          value={`$${reportData?.netProfit || 0}`}
          color={reportData?.netProfit >= 0 ? 'green' : 'red'}
          icon={PlusIcon}
        />
      </div>

      {reportData?.dailyData && reportData.dailyData.length > 0 ? (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChartIcon className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Daily Breakdown</h3>
            <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              {reportData.dailyData.length} days
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Income</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Repairs</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expenses</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.dailyData.map((day, index) => {
                  const netAmount = (day.income || 0) - (day.expenses || 0);
                  return (
                    <tr key={day.date || index} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.date ? new Date(day.date).toLocaleDateString() : `Day ${index + 1}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {day.bookings || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ${day.income || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {day.repairs || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        ${day.expenses || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${netAmount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportData && (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
          <BarChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Daily Data Available</h3>
          <p className="text-gray-500">No daily breakdown data found for Week {reportData.week}, {reportData.year}</p>
        </div>
      )}
    </div>
  );

  const renderCarReport = () => (
    <div className="space-y-8">
      {reportData?.car && (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <BoxIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Car Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Car Name</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{reportData.car.carName}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Plate Number</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{reportData.car.plateNumber}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">Type</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{reportData.car.carType}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <span className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Status</span>
              <p className={`text-lg font-bold mt-1 ${
                reportData.car.status === 'available' ? 'text-green-600' : 
                reportData.car.status === 'rented' ? 'text-blue-600' : 'text-red-600'
              }`}>{reportData.car.status.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {reportData?.stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Income"
            value={`$${reportData.stats.totalIncome}`}
            color="green"
            icon={ArrowUpIcon}
          />
          <StatCard
            title="Total Expenses"
            value={`$${reportData.stats.totalExpenses}`}
            color="red"
            icon={ArrowDownIcon}
          />
          <StatCard
            title="Net Profit"
            value={`$${reportData.stats.netProfit}`}
            color={reportData.stats.netProfit >= 0 ? 'green' : 'red'}
            icon={PlusIcon}
          />
          <StatCard
            title="Utilization Rate"
            value={`${reportData.stats.utilizationRate}%`}
            color="blue"
            icon={BarChartIcon}
          />
        </div>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Business Reports"
        subtitle="Generate comprehensive reports and analytics for your car rental business"
        gradientFrom="cyan"
        gradientTo="blue"
      />

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Report Controls */}
        <div className="bg-white shadow-xl rounded-2xl mb-8 p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChartIcon className="w-6 h-6 text-cyan-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Report Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
                <option value="car">Car Report</option>
              </select>
            </div>

            {reportType === 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {reportType === 'weekly' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                  <input
                    type="number"
                    min="1"
                    max="53"
                    value={filters.week}
                    onChange={(e) => setFilters({ ...filters, week: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}

            {(reportType === 'monthly' || reportType === 'yearly') && (
              <>
                {reportType === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={filters.month}
                      onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}

            {reportType === 'car' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                <input
                  type="text"
                  placeholder="Enter plate number"
                  value={filters.plateNumber}
                  onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            <div>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 border border-transparent rounded-xl text-sm font-bold text-white hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <BarChartIcon className="w-4 h-4 mr-2" />
                    Generate Report
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Generating your report...</p>
          </div>
        ) : reportData ? (
          <div className="animate-fadeIn">
            {reportType === 'daily' && renderDailyReport()}
            {reportType === 'weekly' && renderWeeklyReport()}
            {(reportType === 'monthly' || reportType === 'yearly') && renderDailyReport()}
            {reportType === 'car' && renderCarReport()}
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl p-16 text-center border border-gray-100">
            <BarChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Generated</h3>
            <p className="text-gray-500">Select report parameters and click "Generate Report" to view comprehensive business analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom CSS for animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Reports;
