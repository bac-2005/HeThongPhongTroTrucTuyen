import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Calendar,
  Receipt,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  Calendar as CalendarIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';
import { hostService } from '../../services/hostService';

// Initial mock data
const initialMockData = {
  success: true,
  range: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString()
  },
  kpis: {
    roomsByStatus: [{ _id: "rented", count: 0 }],
    contractsByStatus: [
      { _id: "terminated", count: 0 },
      { _id: "pending", count: 0 }
    ],
    bookingsByStatus: [
      { _id: "approved", count: 0 },
      { _id: "pending", count: 0 }
    ],
    invoicesByStatus: [{ _id: "paid", count: 0 }],
    revenueTotal: 0,
    paymentsPaidCount: 0
  },
  charts: {
    revenueMonthly: [
      { _id: "2025-09", revenue: 0, count: 0 }
    ]
  },
  breakdown: {
    rooms: [{ _id: "rented", count: 0 }],
    contracts: [
      { _id: "terminated", count: 0 },
      { _id: "pending", count: 0 }
    ],
    bookings: [
      { _id: "approved", count: 0 },
      { _id: "pending", count: 0 }
    ]
  }
};

// Status color mapping
const statusColors = {
  rented: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  available: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  terminated: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  deleted: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
};

const pieChartColors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const Dashboard = () => {
  const [data, setData] = useState(initialMockData);
  const [loading, setLoading] = useState(false);

  // Date range state
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const fetchData = async (startDate = fromDate, endDate = toDate) => {
    setLoading(true);
    console.log(startDate, endDate);

    try {
      // Convert dates to ISO string format for API
      const fromDateTime = new Date(startDate).toISOString();
      const toDateTime = new Date(endDate + 'T23:59:59.999Z').toISOString();

      console.log('Fetching data for period:', { from: fromDateTime, to: toDateTime });
      const params = new URLSearchParams({ from: fromDateTime, to: toDateTime }).toString();

      const statsRes = await hostService.adminStatic(params);

      if (statsRes?.data) {
        setData(statsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // You might want to show an error toast/notification here
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle date range change and fetch new data
  const handleDateRangeChange = () => {
    if (fromDate && toDate) {
      // Validate date range
      if (new Date(fromDate) > new Date(toDate)) {
        alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
        return;
      }

      fetchData(fromDate, toDate);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle preset date ranges
  const handlePresetRange = (days) => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const newFromDate = startDate.toISOString().split('T')[0];
    const newToDate = endDate.toISOString().split('T')[0];

    setFromDate(newFromDate);
    setToDate(newToDate);

    fetchData(newFromDate, newToDate);
  };

  // Calculate totals
  const totalRooms = (data.kpis.roomsByStatus).filter((x: any) => x?._id !== "deleted").reduce((sum, item) => sum + item.count, 0);
  const totalContracts = data.kpis.contractsByStatus.reduce((sum, item) => sum + item.count, 0);
  const totalBookings = data.kpis.bookingsByStatus.reduce((sum, item) => sum + item.count, 0);
  const totalInvoices = data.kpis.invoicesByStatus.reduce((sum, item) => sum + item.count, 0);

  // Prepare chart data
  const contractsPieData = data.kpis.contractsByStatus.map((item, index) => ({
    name: item._id === 'pending' ? 'Đang chờ' : item._id === 'terminated' ? 'Đã kết thúc' : item._id,
    value: item.count,
    color: pieChartColors[index % pieChartColors.length]
  }));

  const bookingsPieData = data.kpis.bookingsByStatus.map((item, index) => ({
    name: item._id === 'approved' ? 'Đã duyệt' : item._id === 'pending' ? 'Đang chờ' : item._id,
    value: item.count,
    color: pieChartColors[index % pieChartColors.length]
  }));

  const revenueChartData = data.charts.revenueMonthly.map(item => ({
    month: `Tháng ${item._id.split('-')[1]}`,
    revenue: item.revenue,
    count: item.count
  }));

  const KPICard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
      red: "bg-red-50 border-red-200 text-red-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600"
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    );
  };

  const StatusBreakdownCard = ({ title, data, icon: Icon }) => {
    const getStatusLabel = (status) => {
      const labels = {
        rented: 'Đã cho thuê',
        available: 'Còn trống',
        pending: 'Đang chờ',
        approved: 'Đã duyệt',
        terminated: 'Đã kết thúc',
        paid: 'Đã thanh toán',
        deleted: 'Đã xóa',
        active: 'Đang hoạt động',
      };
      return labels[status] || status;
    };


    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Icon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {data.map((item, index) => {
            const colors = statusColors[item._id] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
                  <span className="text-sm text-gray-700">{getStatusLabel(item._id)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {/* Thống kê từ {formatDate(data.range.from)} đến {formatDate(data.range.to)} */}
            </p>
          </div>

          {/* Date Range Picker and Actions */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Quick preset buttons */}
            {/* <div className="flex space-x-2">
              <button
                onClick={() => handlePresetRange(7)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                7 ngày
              </button>
              <button
                onClick={() => handlePresetRange(30)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                30 ngày
              </button>
              <button
                onClick={() => handlePresetRange(90)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                90 ngày
              </button>
            </div> */}

            {/* Date range inputs */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Từ</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="text-gray-500">đến</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleDateRangeChange}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Đang tải...' : 'Áp dụng'}
              </button>
            </div>

            {/* Action buttons */}
            {/* <div className="flex space-x-2">
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div> */}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-800">Đang cập nhật dữ liệu...</span>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <KPICard
            title="Tổng phòng"
            value={totalRooms}
            icon={Home}
            color="blue"
            trend="up"
            trendValue="5%"
          />
          <KPICard
            title="Hợp đồng"
            value={totalContracts}
            icon={FileText}
            color="green"
            trend="up"
            trendValue="12%"
          />
          <KPICard
            title="Đặt phòng"
            value={totalBookings}
            icon={Calendar}
            color="yellow"
            trend="down"
            trendValue="3%"
          />
          <KPICard
            title="Hóa đơn"
            value={totalInvoices}
            icon={Receipt}
            color="purple"
          />
          <KPICard
            title="Doanh thu"
            value={formatCurrency(data.kpis.revenueTotal)}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="25%"
          />
          <KPICard
            title="Thanh toán"
            value={data.kpis.paymentsPaidCount}
            icon={CheckCircle}
            color="blue"
          />
        </div>

        {/* Charts and Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Biểu đồ doanh thu theo tháng"
              actions={[
                <button key="bar" className="p-2 text-gray-400 hover:text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                </button>
              ]}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Contracts Pie Chart */}
          <div>
            <ChartCard title="Phân bố hợp đồng">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={contractsPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {contractsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatusBreakdownCard
            title="Trạng thái phòng"
            data={data.breakdown.rooms}
            icon={Home}
          />
          <StatusBreakdownCard
            title="Trạng thái hợp đồng"
            data={data.breakdown.contracts}
            icon={FileText}
          />
          <StatusBreakdownCard
            title="Trạng thái đặt phòng"
            data={data.breakdown.bookings}
            icon={Calendar}
          />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Pie Chart */}
          <ChartCard title="Phân bố đặt phòng">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={bookingsPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tóm tắt thống kê</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Tỷ lệ lấp đầy phòng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {totalRooms > 0 ? (((data.kpis.roomsByStatus).filter((x: any) => x?._id !== "deleted").find(r => r._id === 'rented')?.count || 0) / totalRooms * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Tỷ lệ duyệt đặt phòng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {totalBookings > 0 ? ((data.kpis.bookingsByStatus.find(b => b._id === 'approved')?.count || 0) / totalBookings * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Doanh thu trung bình/tháng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(data.charts.revenueMonthly.length > 0 ? data.kpis.revenueTotal / data.charts.revenueMonthly.length : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;