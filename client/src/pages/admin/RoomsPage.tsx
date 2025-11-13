import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Search,
  Eye,
  Trash2,
  User,
  Calendar,
  MapPin,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  X,
  ChevronDown
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { roomService } from '../../services/roomService';
import type { Room, RoomStats, RoomFilters } from '../../types/room';
import { truncate } from '../../utils/format';

// Room Modal Component (View only)
interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  status?: string | null;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, roomId, status }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  const { error } = useToastContext();

  useEffect(() => {
    if (isOpen && roomId) {
      loadRoom();
    }
  }, [isOpen, roomId]);

  const loadRoom = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const roomData = await roomService.getRoomById(roomId);
      setRoom(roomData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoomTypeText = (type: Room['roomType']) => {
    switch (type) {
      case 'single': return 'Phòng đơn';
      case 'double': return 'Phòng đôi';
      case 'apartment': return 'Căn hộ';
      case 'shared': return 'Phòng chung';
      default: return 'Không xác định';
    }
  };

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'available': return 'Còn trống';
      case 'rented': return 'Đã thuê';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalText = (status?: Room['approvalStatus']) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Chờ duyệt'; // Default to pending if not set
    }
  };

  const getApprovalColor = (status?: Room['approvalStatus']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // Default to pending style
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  const availableUtilities = [
    { key: 'wifi', label: 'Wifi' },
    { key: 'airconditioner', label: 'Điều hòa' },
    { key: 'washing_machine', label: 'Máy giặt' },
    { key: 'kitchen', label: 'Bếp' },
    { key: 'parking', label: 'Chỗ đậu xe' },
    { key: 'elevator', label: 'Thang máy' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết phòng trọ
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề phòng
                  </label>
                  <p className="text-gray-900 font-medium">{room?.roomTitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại phòng
                  </label>
                  <p className="text-gray-900">{getRoomTypeText(room?.roomType || 'single')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá thuê
                  </label>
                  <p className="text-gray-900 font-medium text-green-600">{formatPrice(room?.price?.value || 0)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diện tích
                  </label>
                  <p className="text-gray-900">{room?.area}m²</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{room?.location}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <p className="text-gray-900 leading-relaxed">{room?.description}</p>
              </div>

              {/* Images */}
              {room?.images && room.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Room ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Utilities */}
              {room?.utilities && room.utilities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiện ích
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {room.utilities.map((utility) => {
                      const utilityInfo = availableUtilities.find(u => u.key === utility);
                      return (
                        <span key={utility} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {utilityInfo?.label || utility}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Terms */}
              {room?.terms && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điều khoản
                  </label>
                  <p className="text-gray-900">{room.terms}</p>
                </div>
              )}

              {/* Status and Approval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái phòng
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(room?.status || 'available')}`}>
                    {getStatusText(room?.status || 'available')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái duyệt
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getApprovalColor(status)}`}>
                    {getApprovalText(status)}
                  </span>
                </div>
              </div>

              {/* Host Info */}
              {room?.host && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông tin chủ trọ
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {room.host.avatar ? (
                          <img
                            src={room.host.avatar}
                            alt={room.host.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{room.host.fullName}</p>
                        <p className="text-sm text-gray-500">{room.host.email}</p>
                        {room.host.phone && (
                          <p className="text-sm text-gray-500">{room.host.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Created Date */}
              {room?.dateAdded && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{formatDate(room.dateAdded)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Dropdown Component
interface StatusDropdownProps {
  currentStatus: Room['status'];
  roomId: string;
  onStatusChange: (roomId: string, status: Room['status']) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, roomId, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'available', label: 'Còn trống', color: 'bg-green-100 text-green-800' },
    { value: 'rented', label: 'Đã thuê', color: 'bg-blue-100 text-blue-800' },
    { value: 'maintenance', label: 'Bảo trì', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const currentOption = statusOptions.find(option => option.value === currentStatus);

  const handleStatusSelect = (status: Room['status']) => {
    onStatusChange(roomId, status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${currentOption?.color} hover:opacity-80 transition-opacity`}
      >
        {currentOption?.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusSelect(option.value as Room['status'])}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 block ${option.value === currentStatus ? 'bg-gray-100' : ''
                }`}
            >
              <span className={`inline-block px-2 py-1 rounded-full ${option.color}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get approval status for a room
const getRoomApprovalStatus = (roomId: string, roomApprovals: any[]): Room['approvalStatus'] => {
  const approval = roomApprovals.find(approval => approval.roomId === roomId);
  return approval?.approvalStatus || 'pending';
};

const getApprovalText = (status?: Room['approvalStatus']) => {
  switch (status) {
    case 'approved': return 'Đã duyệt';
    case 'pending': return 'Chờ duyệt';
    case 'rejected': return 'Từ chối';
    default: return 'Chờ duyệt'; // Default to pending if not set
  }
};
// Main Rooms Page Component
const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomApprovals, setRoomApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<RoomStats>({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RoomFilters>({
    roomType: 'all',
    status: 'all',
    approvalStatus: 'all',
    searchTerm: ''
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, statsData, approvalsData] = await Promise.all([
        roomService.getRoomsAdmin(filters),
        roomService.getRoomStats(),
        roomService.getRoomApprovals() // This method needs to be implemented
      ]);
      const data = roomsData.data
      const rooms = (roomsData.data?.rooms || []).filter((x: any) => x.status !== "deleted")
      setRooms(rooms);
      const rented = [...rooms].filter((x: any) => x.status === "rented").length
      const pending = [...rooms].filter((x: any) => x.status === "available").length
      const status = {
        total: rooms.length,
        available: Number(rooms.length - rented),
        rented: rented,
        pending: pending,
      }
      setStats((pre) => ({ ...pre, ...status }));
      setRoomApprovals(approvalsData.data || []);
      console.log('Room Approvals:', roomApprovals);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải dữ liệu phòng trọ');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced rooms with approval status
  const roomsWithApproval = useMemo(() => {
    return rooms.map(room => {
      const a = roomApprovals.find(x => x.roomId === (room.roomId));
      const st = (a?.status ?? a?.approvalStatus ?? 'pending') as Room['approvalStatus'];

      return {
        ...room,
        approvalId: a?.approvalId,
        approvalStatus: st,
        approvalNote: a?.note
      };
    });

  }, [rooms, roomApprovals]);


  const filteredRooms = useMemo(() => {
    return roomsWithApproval.filter(room => {
      const matchesSearch = !filters.searchTerm ||
        room.roomTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesType = filters.roomType === 'all' || room.roomType === filters.roomType;
      const matchesStatus = filters.status === 'all' || room.status === filters.status;
      const matchesApproval = filters.approvalStatus === 'all' || room.approvalStatus === filters.approvalStatus;

      return matchesSearch && matchesType && matchesStatus && matchesApproval;
    });
  }, [roomsWithApproval, filters]);

  const handleViewRoom = (roomId: string, status: string) => {
    setSelectedRoomId(roomId);
    setApprovalStatus(status)
    setIsModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) return;

    try {
      await roomService.deleteRoom(roomId);
      success('Thành công', 'Xóa phòng trọ thành công');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa phòng trọ');
    }
  };

  const handleUpdateApproval = async (roomId: string, status: Room['approvalStatus']) => {
    try {
      await roomService.updateApprovalStatus(roomId, status);

      // Update local state immediately
      setRoomApprovals(prevApprovals => {
        const existingIndex = prevApprovals.findIndex(approval => approval.roomId === roomId);
        if (existingIndex >= 0) {
          // Update existing approval
          const updatedApprovals = [...prevApprovals];
          updatedApprovals[existingIndex] = { ...updatedApprovals[existingIndex], approvalStatus: status };
          return updatedApprovals;
        } else {
          // Add new approval
          return [...prevApprovals, { roomId, approvalStatus: status, approvalDate: new Date().toISOString() }];
        }
      });

      success('Thành công', `${status === 'approved' ? 'Duyệt' : 'Từ chối'} phòng trọ thành công`);

      // Reload data to ensure sync
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật trạng thái duyệt');
    }
  };

  const handleStatusChange = async (roomId: string, status: Room['status']) => {
    try {
      await roomService.updateRoom(roomId, { status });

      // Update local state immediately
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === roomId || room.roomId === roomId
            ? { ...room, status: status }
            : room
        )
      );

      success('Thành công', 'Cập nhật trạng thái phòng thành công');

      // Reload data to ensure sync
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật trạng thái phòng');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoomId(null);
    setApprovalStatus(null);
  };

  const getRoomTypeText = (type: Room['roomType']) => {
    switch (type) {
      case 'single': return 'Phòng đơn';
      case 'double': return 'Phòng đôi';
      case 'apartment': return 'Căn hộ';
      case 'shared': return 'Phòng chung';
      default: return 'Không xác định';
    }
  };

  const getApprovalColor = (status?: Room['approvalStatus']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // Default to pending style
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có dữ liệu';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng trọ</h1>
          <p className="text-gray-600">Quản lý thông tin và trạng thái phòng trọ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng phòng trọ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Còn trống</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Home className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thuê</p>
              <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
              placeholder="Tìm kiếm theo tên phòng, địa điểm..."
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.roomType}
              onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value as Room['roomType'] | 'all' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại phòng</option>
              <option value="single">Phòng đơn</option>
              <option value="double">Phòng đôi</option>
              <option value="apartment">Căn hộ</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as Room['status'] | 'all' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Còn trống</option>
              <option value="rented">Đã thuê</option>
              <option value="maintenance">Bảo trì</option>
            </select>

            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value as Room['approvalStatus'] | 'all' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách phòng trọ ({filteredRooms.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duyệt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4" title={`${room.roomTitle}\n${room.location}`}>
                    <div className="flex items-start gap-3">
                      {room.images && room.images.length > 0 && (
                        <img
                          src={room.images[0]}
                          alt={room.roomTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {truncate(room.roomTitle)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{truncate(room.location)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {room.area}m²
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {room.host?.avatar ? (
                          <img
                            src={room.host.avatar}
                            alt={room.host.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {room.hostId || room?.host?.fullName || room?.host?.userId || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getRoomTypeText(room.roomType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatPrice(room.price.value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown
                      currentStatus={room.status}
                      roomId={room.roomId}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(room.approvalStatus)}`}>
                      {getApprovalText(room.approvalStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(room.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {room.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateApproval(room.roomId || room.id, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Duyệt phòng"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateApproval(room.roomId || room.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Từ chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewRoom(room.roomId, room.approvalStatus)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Xóa phòng"
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

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy phòng trọ nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Room Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roomId={selectedRoomId}
        status={approvalStatus}
      />
    </div>
  );
};

export default RoomsPage;