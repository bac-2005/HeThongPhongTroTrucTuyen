import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  Trash2,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  X,
  ChevronDown,
  LockOpen
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/userService';
import type { User as UserType, UserStats, UserFilters } from '../../types/user';

// User Modal Component (chỉ để xem)
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const { error } = useToastContext();

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData.data);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'host': return 'Chủ trọ';
      case 'tenant': return 'Người thuê';
      case 'guest': return 'Khách';
      default: return 'Không xác định';
    }
  };

  const getStatusText = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ duyệt';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết người dùng</h3>
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
          ) : user ? (
            <div className="p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.fullName}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{getRoleText(user.role)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </span>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  {user.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Chưa cập nhật</p>
                  )}
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD/CMND
                  </label>
                  {user.idNumber ? (
                    <p className="text-gray-900">{user.idNumber}</p>
                  ) : (
                    <p className="text-gray-500 italic">Chưa cập nhật</p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                {user.dob ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{new Date(user.dob).toLocaleDateString('vi-VN')}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Chưa cập nhật</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                {user.address ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-900">{user.address}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Chưa cập nhật</p>
                )}
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo tài khoản
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
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

// Role Selector Component
interface RoleSelectorProps {
  currentRole: UserType['role'];
  userId: string;
  onRoleChange: (userId: string, newRole: UserType['role']) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, userId, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { value: 'tenant', label: 'Người thuê', color: 'bg-green-100 text-green-800' },
    { value: 'host', label: 'Chủ trọ', color: 'bg-blue-100 text-blue-800' },
    { value: 'admin', label: 'Quản trị viên', color: 'bg-purple-100 text-purple-800' },
    { value: 'guest', label: 'Khách', color: 'bg-gray-100 text-gray-800' }
  ];

  const currentRoleData = roles.find(role => role.value === currentRole);

  const handleRoleSelect = (newRole: UserType['role']) => {
    if (newRole !== currentRole) {
      onRoleChange(userId, newRole);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${currentRoleData?.color}`}
      >
        {currentRoleData?.label}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleRoleSelect(role.value as UserType['role'])}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors block ${role.value === currentRole ? 'bg-blue-50 font-medium' : ''
                }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Users Page Component
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    admins: 0,
    hosts: 0,
    tenants: 0,
    guests: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        userService.getUsers(filters),
        userService.getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !filters.searchTerm ||
        user.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(filters.searchTerm));

      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await userService.deleteUser(userId);
      success('Thành công', 'Xóa người dùng thành công');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa người dùng');
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserType['status']) => {
    try {
      await userService.updateUserStatus(userId, status);
      success('Thành công', 'Cập nhật trạng thái thành công');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserType['role']) => {
    try {
      await userService.updateUserRole(userId, newRole);
      success('Thành công', 'Cập nhật vai trò thành công');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật vai trò');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const getStatusText = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ duyệt';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và thông tin người dùng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chủ trọ</p>
              <p className="text-2xl font-bold text-purple-600">{stats.hosts}</p>
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
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as UserType['role'] | 'all' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              {/* <option value="admin">Quản trị viên</option> */}
              <option value="host">Chủ trọ</option>
              <option value="tenant">Người thuê</option>
              <option value="guest">Khách</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as UserType['status'] | 'all' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="pending">Chờ duyệt</option>
            </select>
            {/* <button className='btn btn-primary'>Thêm mới</button> */}

          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách người dùng ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-xs">{user.address}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleSelector
                      currentRole={user.role}
                      userId={user.userId}
                      onRoleChange={handleRoleChange}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewUser(user.userId)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(user.userId, 'active')}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Duyệt tài khoản"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleUpdateStatus(user.userId, 'inactive')}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Vô hiệu hóa"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleUpdateStatus(user.userId, 'active')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-red-50"
                          title="Hủy khóa tài khoản"
                        >
                          <LockOpen className="w-4 h-4" />
                        </button>
                      )}
                      {/* <button
                        onClick={() => handleDeleteUser(user.userId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Xóa người dùng"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy người dùng nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* User Modal (chỉ để xem) */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={selectedUserId}
      />
    </div>
  );
};

export default UsersPage;