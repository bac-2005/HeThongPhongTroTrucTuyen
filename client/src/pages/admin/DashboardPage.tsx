import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildHeaders } from '../../utils/config';
interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  occupancyRate: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const API_URL = 'http://localhost:3000';

      // Fetch data từ nhiều endpoint
      const [usersRes, roomsRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: buildHeaders() }),
        fetch(`${API_URL}/rooms`, { headers: buildHeaders() }),
        fetch(`${API_URL}/bookings`, { headers: buildHeaders() }),
        fetch(`${API_URL}/payments`, { headers: buildHeaders() })
      ]);


      const [users, rooms, bookings, payments] = await Promise.all([
        usersRes.json(),
        roomsRes.json(),
        bookingsRes.json(),
        paymentsRes.json()
      ]);

      // Tính toán thống kê
      
      const totalRevenue = payments.data.reduce((sum: number, payment: any) =>
        payment.paymentStatus === "paid" ? sum + payment.amount : sum, 0
      );

      const currentMonth = new Date().getMonth();
      const newUsersThisMonth = users.data.users.filter((u: any) =>
        new Date(u.createdAt).getMonth() === currentMonth
      ).length;

      const rentedRooms = rooms.data.rooms.filter((r: any) => r.status === 'rented').length;
      const occupancyRate = rooms.data.pagination.totalRooms > 0 ? (rentedRooms / rooms.data.pagination.totalRooms) * 100 : 0;

      setStats({
        totalUsers: users.data.pagination.totalUsers,
        totalRooms: rooms.data.pagination.totalRooms,
        totalBookings: bookings.data.length,
        totalRevenue,
        newUsersThisMonth,
        occupancyRate
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats.newUsersThisMonth} tháng này`,
      changeType: 'increase'
    },
    {
      title: 'Tổng phòng trọ',
      value: stats.totalRooms,
      icon: Building,
      color: 'bg-green-500',
      change: `${stats.occupancyRate.toFixed(1)}% đã thuê`,
      changeType: 'neutral'
    },
    {
      title: 'Đặt phòng',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: 'Tổng đặt phòng',
      changeType: 'neutral'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: CreditCard,
      color: 'bg-purple-500',
      change: 'Tổng thu nhập',
      changeType: 'increase'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Chào mừng, {user?.fullName}! 👋
            </h1>
            <p className="text-blue-100">
              Đây là tổng quan về hệ thống quản lý cho thuê trọ của bạn
            </p>
          </div>
          <div className="hidden md:block">
            <Home className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof card.value === 'number' && card.title !== 'Doanh thu'
                    ? card.value.toLocaleString()
                    : card.value
                  }
                </p>
                <div className="flex items-center mt-2">
                  {card.changeType === 'increase' && (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  )}
                  {card.changeType === 'decrease' && (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${card.changeType === 'increase' ? 'text-green-600' :
                    card.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
