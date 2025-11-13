import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  MapPin,
  Clock,
  X,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { buildHeaders } from '../../utils/config';
import { truncate } from '../../utils/format';

interface Contract {
  id: string;
  contractId: string;
  roomId: string;
  tenantId: string;
  createdAt: string;
  duration: number;
  rentPrice: number;
  terms: string;
  room: {
    roomTitle: string;
    location: string;
    area: number;
    hostId: string;
  };
  tenant: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  host: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

// Helper functions for date validation and formatting
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const safeFormatDate = (dateString: string): string => {
  if (!isValidDate(dateString)) return 'Ngày không hợp lệ';

  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

const safeCalculateEndDate = (createdAt: string, duration: number): Date | null => {
  if (!isValidDate(createdAt) || !duration || duration <= 0) {
    return null;
  }

  try {
    const start = new Date(createdAt);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    // Verify the result is still a valid date
    if (isNaN(end.getTime())) {
      return null;
    }

    return end;
  } catch (error) {
    return null;
  }
};

// Contract Detail Modal Component
interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ isOpen, onClose, contract }) => {
  const formatDate = (dateString: string) => {
    return safeFormatDate(dateString);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  console.log(contract);


  const calculateEndDate = (startDate: string, duration: number) => {
    return safeCalculateEndDate(startDate, duration);
  };

  if (!isOpen || !contract) return null;

  const endDate = calculateEndDate(contract.createdAt, contract.duration);
  const remainingDays = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isActive = remainingDays > 0;
  const isExpiringSoon = remainingDays <= 30 && remainingDays > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết hợp đồng</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-6">
            {/* Contract Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Thông tin hợp đồng</h4>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${isActive
                  ? isExpiringSoon
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {isActive
                    ? isExpiringSoon
                      ? 'Sắp hết hạn'
                      : 'Đang hiệu lực'
                    : 'Đã hết hạn'
                  }
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã hợp đồng</p>
                  <p className="font-medium text-gray-900">{contract.contractId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày ký hợp đồng</p>
                  <p className="font-medium text-gray-900">{formatDate(contract.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời hạn</p>
                  <p className="font-medium text-gray-900">{contract.duration} tháng</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kết thúc dự kiến</p>
                  <p className="font-medium text-gray-900">
                    {endDate ? formatDate(endDate.toISOString()) : 'Không xác định'}
                  </p>
                  {remainingDays > 0 && remainingDays <= 30 && (
                    <p className="text-sm text-orange-600 font-medium">Còn {remainingDays} ngày</p>
                  )}
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin phòng trọ</h4>
              <div className="flex items-start gap-4">
                <Home className="w-8 h-8 text-gray-500 mt-1" />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{contract.room.roomTitle}</h5>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{contract.room.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Diện tích: <span className="font-medium">{contract.room.area}m²</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Giá thuê: <span className="font-medium text-green-600">{formatPrice(Number(contract.rentPrice / contract.duration))}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin người thuê</h4>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {contract.tenant.avatar ? (
                    <img
                      src={contract.tenant.avatar}
                      alt={contract.tenant.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{contract.tenant.fullName}</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{contract.tenant.email}</span>
                    </div>
                    {contract.tenant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{contract.tenant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin chủ trọ</h4>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {contract.host.avatar ? (
                    <img
                      src={contract.host.avatar}
                      alt={contract.host.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{contract.host.fullName}</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{contract.host.email}</span>
                    </div>
                    {contract.host.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{contract.host.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Điều khoản hợp đồng</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{contract.terms}</p>
              </div>
            </div>

            {/* Contract Timeline */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thời gian hợp đồng</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="font-medium text-gray-900">Ký hợp đồng</p>
                    <p className="text-gray-600">{formatDate(contract.createdAt)}</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${remainingDays > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    <p className="font-medium text-gray-900">Kết thúc dự kiến</p>
                    <p className="text-gray-600">
                      {endDate ? formatDate(endDate.toISOString()) : 'Không xác định'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);

      // Fetch contracts, rooms, and users
      const [contractsRes, roomsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/contracts?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/rooms?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/users?limit=9999', { headers: buildHeaders() })
      ]);

      const [contractsData, roomsData, usersData] = await Promise.all([
        contractsRes.json(),
        roomsRes.json(),
        usersRes.json()
      ]);

      // Combine data
      const enrichedContracts = contractsData.data.contracts.map((contract: any) => {
        const room = contract.roomInfo;
        const tenant = contract.tenantInfo;
        const detailRoom = roomsData?.data?.rooms?.find((x: any) => x.roomId === room?.roomId)
        // Find host through room's hostId
        const host = room ? usersData.data.users.find((u: any) => u.id === room.hostId) : null;

        return {
          ...contract,
          room: detailRoom || { roomTitle: 'Phòng không tồn tại', location: 'Không xác định', area: 0 },
          roomInfo: detailRoom || { roomTitle: 'Phòng không tồn tại', location: 'Không xác định', area: 0 },
          tenant: tenant || { fullName: 'Người dùng không tồn tại', email: 'unknown@example.com' },
          host: host || { fullName: 'Chủ trọ không tồn tại', email: 'unknown@example.com' }
        };
      });

      setContracts(enrichedContracts);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.host.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetail = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  const formatDate = (dateString: string) => {
    if (!isValidDate(dateString)) return 'Ngày không hợp lệ';

    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateEndDate = (startDate: string, duration: number) => {
    return safeCalculateEndDate(startDate, duration);
  };

  const isExpiringSoon = (startDate: string, duration: number) => {
    const endDate = calculateEndDate(startDate, duration);
    if (!endDate) return false;

    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getContractStatus = (createdAt: string, duration: number) => {
    const endDate = calculateEndDate(createdAt, duration);
    if (!endDate) return 'unknown';

    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 30) return 'active';
    if (daysUntilExpiry > 0) return 'expiring';
    return 'expired';
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => getContractStatus(c.createdAt, c.duration) === 'active').length,
    expiring: contracts.filter(c => getContractStatus(c.createdAt, c.duration) === 'expiring').length,
    expired: contracts.filter(c => getContractStatus(c.createdAt, c.duration) === 'expired').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
          <p className="text-gray-600">Quản lý hợp đồng thuê phòng và theo dõi trạng thái</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hiệu lực</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hợp đồng, tên phòng, khách hàng, chủ trọ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách hợp đồng ({filteredContracts.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => {
                const endDate = calculateEndDate(contract.createdAt, contract.duration);
                const status = getContractStatus(contract.createdAt, contract.duration);

                return (
                  <tr key={contract.id} className={`hover:bg-gray-50 ${status === 'expiring' ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.contractId}</div>
                      <div className="text-sm text-gray-500">{formatDate(contract.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4" title={`${contract.room.roomTitle}\n${contract.room.location}`}>
                      <div className="flex items-start gap-3">
                        <Building className="w-8 h-8 text-gray-400 mt-1" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {truncate(contract.room.roomTitle)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{truncate(contract.room.location)}</span>
                          </div>
                          {/* <div className="text-sm text-gray-500">
                            {contract.room.area}m²
                          </div> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {contract.tenant.avatar ? (
                            <img
                              src={contract.tenant.avatar}
                              alt={contract.tenant.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {contract.tenant.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.tenant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {contract.host.avatar ? (
                            <img
                              src={contract.host.avatar}
                              alt={contract.host.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {contract.host.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.host.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(contract.createdAt)} - {endDate ? formatDate(endDate.toISOString()) : 'Không xác định'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.duration} tháng
                      </div>
                      {status === 'expiring' && (
                        <div className="text-xs text-orange-600 font-medium">
                          Sắp hết hạn
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatPrice(Number(contract.rentPrice / contract.duration))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' :
                        status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                          status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {status === 'active' ? 'Đang hiệu lực' :
                          status === 'expiring' ? 'Sắp hết hạn' :
                            status === 'expired' ? 'Đã hết hạn' :
                              'Không xác định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(contract)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy hợp đồng nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        contract={selectedContract}
      />
    </div>
  );
};

export default ContractsPage;

