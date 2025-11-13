import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  MapPin,
  Phone,
  Mail,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { buildHeaders } from '../../utils/config';
import { truncate } from '../../utils/format';

interface Booking {
  id: string;
  bookingId: string;
  roomId: string;
  tenantId: string;
  bookingDate: string;
  note: string;
  bookingStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt?: string;
  room: {
    roomTitle: string;
    location: string;
    price: number;
    images: string[];
    area?: number;
    roomType?: string;
  };
  tenant: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    userId?: string;
  };
}

// Booking Detail Modal Component
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  mode: 'view';
  onSave: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, booking, mode, onSave }) => {
  const [formData, setFormData] = useState({
    note: '',
    bookingStatus: 'pending' as Booking['bookingStatus']
  });
  const [saving, setSaving] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    if (booking) {
      setFormData({
        note: booking.note,
        bookingStatus: booking.bookingStatus
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      setSaving(true);

      const response = await fetch(`http://localhost:3000/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      success('Thành công', 'Cập nhật đặt phòng thành công');
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật đặt phòng');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có dữ liệu';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'Không có dữ liệu';
    return new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(dateString));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'rejected': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getRoomTypeText = (type?: string) => {
    switch (type) {
      case 'single': return 'Phòng đơn';
      case 'double': return 'Phòng đôi';
      case 'shared': return 'Phòng chia sẻ';
      case 'apartment': return 'Căn hộ';
      default: return 'Không xác định';
    }
  };

  if (!isOpen || !booking) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isViewMode ? 'Chi tiết đặt phòng' : 'Chỉnh sửa đặt phòng'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Thông tin đặt phòng</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã đặt phòng
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{booking.bookingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày đặt phòng
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{formatShortDate(booking.startDate)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{formatDate(booking.createdAt || booking.bookingDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Thông tin phòng trọ</h4>
              <div className="flex items-start gap-4">
                {booking.room.images && booking.room.images.length > 0 && (
                  <img
                    src={booking.room.images[0]}
                    alt={booking.room.roomTitle}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{booking.room.roomTitle}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{booking.room.location}</span>
                    </div>
                    <div className="text-lg font-medium text-green-600">
                      {formatPrice(booking.room.price.value)}
                    </div>
                    {booking.room.area && (
                      <div className="text-sm text-gray-600">
                        Diện tích: {booking.room.area}m²
                      </div>
                    )}
                    {booking.room.roomType && (
                      <div className="text-sm text-gray-600">
                        Loại phòng: {getRoomTypeText(booking.room.roomType)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Thông tin khách hàng</h4>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {booking.tenant.avatar ? (
                    <img
                      src={booking.tenant.avatar}
                      alt={booking.tenant.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{booking.tenant.fullName}</h5>
                  <div className="space-y-1">
                    {booking.tenant.userId && (
                      <div className="text-sm text-gray-500">
                        ID: {booking.tenant.userId}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{booking.tenant.email}</span>
                    </div>
                    {booking.tenant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{booking.tenant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              {isViewMode ? (
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {getStatusText(booking.bookingStatus)}
                </span>
              ) : (
                <select
                  value={formData.bookingStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, bookingStatus: e.target.value as Booking['bookingStatus'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="approved">Đã xác nhận</option>
                  <option value="rejected">Đã hủy</option>
                </select>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              {isViewMode ? (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {booking.note || 'Không có ghi chú'}
                </p>
              ) : (
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú về đặt phòng..."
                />
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            {isViewMode ? 'Đóng' : 'Hủy'}
          </button>
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Bookings Page Component
const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view'>('view');

  const { success, error } = useToastContext();

  useEffect(() => {
    try {
      loadBookings();
    } catch (error) {
      loadBookings();
    }
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Fetch bookings, rooms, and users
      const [bookingsRes, roomsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/bookings?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/rooms?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/users?limit=9999', { headers: buildHeaders() })
      ]);

      const [bookingsData, roomsData, usersData] = await Promise.all([
        bookingsRes.json(),
        roomsRes.json(),
        usersRes.json()
      ]);

      // Combine data with proper mapping based on your database structure
      const enrichedBookings = bookingsData.data.map((booking: any) => {
        // Find room by roomId (matching your database structure)
        const room = roomsData.data.rooms.find((r: any) =>
          r.roomId === booking.roomId || r.id === booking.roomId
        );

        // Find tenant by tenantId (matching your database structure)
        const tenant = usersData.data.users.find((u: any) =>
          u.userId === booking.tenantId || u.id === booking.tenantId
        );

        return {
          ...booking,
          // Add createdAt if not exists (use bookingDate as fallback)
          createdAt: booking.createdAt || booking.bookingDate,
          room: room ? {
            roomTitle: room.roomTitle || 'Phòng không xác định',
            location: room.location || 'Địa điểm không xác định',
            price: room.price || 0,
            images: room.images || [],
            area: room.area,
            roomType: room.roomType
          } : {
            roomTitle: 'Phòng không tìm thấy',
            location: 'Không xác định',
            price: 0,
            images: []
          },
          tenant: tenant ? {
            fullName: tenant.fullName || 'Khách hàng không xác định',
            email: tenant.email || 'Email không xác định',
            phone: tenant.phone,
            avatar: tenant.avatar,
            userId: tenant.userId
          } : {
            fullName: 'Khách hàng không tìm thấy',
            email: 'unknown@example.com'
          }
        };
      });

      setBookings(enrichedBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      error('Lỗi', 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.bookingId && booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({ bookingStatus: status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      success('Thành công', `${status === 'approved' ? 'Xác nhận' : 'Hủy'} đặt phòng thành công`);
      await loadBookings();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật trạng thái đặt phòng');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đặt phòng này?')) return;

    try {
      const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      success('Thành công', 'Xóa đặt phòng thành công');
      await loadBookings();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa đặt phòng');
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveModal = () => {
    loadBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã thanh toán';
      case 'pending': return 'Chưa thanh toán';
      case 'cancelled': return 'Đã hủy';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const getStatusBookingText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã xác nhận';
      case 'pending': return 'Chưa xác nhận';
      case 'rejected': return 'Từ chối xác nhận';
      case 'cancelled': return 'Đóng xác nhận';
      default: return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có dữ liệu';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'approved').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'rejected').length
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-gray-600">Quản lý các yêu cầu đặt phòng từ khách hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đặt phòng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đặt phòng, tên phòng, khách hàng, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="approved">Đã xác nhận</option>
            <option value="rejected">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách đặt phòng ({filteredBookings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đặt phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái xác nhận
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-900">
                      {booking.bookingId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {booking.room.images && booking.room.images.length > 0 && (
                        <img
                          src={booking.room.images[0]}
                          alt={booking.room.roomTitle}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {booking.room?.roomTitle}
                        </div>
                        {/* <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{booking.room.location}</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {formatPrice(booking.room.price)}
                        </div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {booking.tenant.avatar ? (
                          <img
                            src={booking.tenant.avatar}
                            alt={booking.tenant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{booking.tenant.fullName}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          {booking.tenant.email}
                        </div>
                        {booking.tenant.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.tenant.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <div className="text-sm text-gray-900">{formatDate(booking.bookingDate)}</div> */}
                    {booking.createdAt && booking.createdAt !== booking.bookingDate && (
                      <div className="text-sm text-gray-500">Tạo: {formatDate(booking.createdAt)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {truncate(booking.note) || 'Không có ghi chú'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                      {getStatusText(booking.bookingStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusBookingText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* {booking.bookingStatus === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(booking.bookingId, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Xác nhận đặt phòng"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(booking.bookingId, 'rejected')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Hủy đặt phòng"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )} */}
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => handleDeleteBooking(booking.bookingId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Xóa đặt phòng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy đặt phòng nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        mode={modalMode}
        onSave={handleSaveModal}
      />
    </div>
  );
};

export default BookingsPage;