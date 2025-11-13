import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  User, 
  Building, 
  Calendar, 
  DollarSign,
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Search,
  Download,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  Home,
  Banknote,
  Wallet
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { buildHeaders } from '../../utils/config';

interface Payment {
  id: string;
  paymentId: string;
  tenantId: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  extraNote: string;
  tenant: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  contract: {
    roomId: string;
    room: {
      roomTitle: string;
      location: string;
    };
  };
}

// Payment Detail Modal Component
interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, payment }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có thông tin';
    
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết thanh toán</h3>
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
            {/* Payment Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Thông tin thanh toán</h4>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                  {getStatusText(payment.paymentStatus)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã thanh toán</p>
                  <p className="font-medium text-gray-900">{payment.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-bold text-green-600 text-lg">{formatPrice(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày thanh toán</p>
                  <p className="font-medium text-gray-900">{formatDate(payment.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã hợp đồng</p>
                  <p className="font-medium text-gray-900">{payment.contractId}</p>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin phòng trọ</h4>
              <div className="flex items-start gap-4">
                <Home className="w-8 h-8 text-gray-500 mt-1" />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{payment.contract.room.roomTitle}</h5>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{payment.contract.room.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin người thuê</h4>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {payment.tenant.avatar ? (
                    <img 
                      src={payment.tenant.avatar} 
                      alt={payment.tenant.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{payment.tenant.fullName}</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{payment.tenant.email}</span>
                    </div>
                    {payment.tenant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{payment.tenant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Notes */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Phương thức & Ghi chú thanh toán</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {payment.extraNote || 'Chưa có thông tin thanh toán'}
                </p>
              </div>
            </div>

            {/* Payment Timeline */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Lịch sử thanh toán</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="font-medium text-gray-900">Tạo yêu cầu</p>
                    <p className="text-gray-600">{formatDate(payment.paymentDate)}</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      payment.paymentStatus === 'paid' ? 'bg-green-500' : 
                      payment.paymentStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <p className="font-medium text-gray-900">Trạng thái hiện tại</p>
                    <p className="text-gray-600">{getStatusText(payment.paymentStatus)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h5 className="font-medium text-blue-900">Thông tin giao dịch</h5>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800">Mã thanh toán: {payment.paymentId}</p>
                  <p className="text-blue-800">Số tiền: {formatPrice(payment.amount)}</p>
                  <p className="text-blue-800">Phương thức: {payment.extraNote || 'Chưa xác định'}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h5 className="font-medium text-green-900">Hợp đồng liên quan</h5>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-green-800">Mã hợp đồng: {payment.contractId}</p>
                  <p className="text-green-800">Phòng: {payment.contract.room.roomTitle}</p>
                  <p className="text-green-800">Địa điểm: {payment.contract.room.location}</p>
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

// Payment Confirmation Modal Component
interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onConfirm: (paymentId: string, finalNote: string) => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  payment, 
  onConfirm 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [note, setNote] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleConfirm = () => {
    if (!payment) return;
    
    // Tạo ghi chú với phương thức thanh toán
    const methodText = {
      'bank': 'Thanh toán qua ngân hàng',
      'cash': 'Thanh toán bằng tiền mặt', 
      'ewallet': 'Thanh toán qua ví điện tử',
      'installment': 'Thanh toán từ từ'
    }[paymentMethod] || 'Thanh toán';
    
    const finalNote = note ? `${methodText}. ${note}` : methodText;
    onConfirm(payment.id, finalNote);
    onClose();
    setNote('');
    setPaymentMethod('bank');
  };

  const handleClose = () => {
    onClose();
    setNote('');
    setPaymentMethod('bank');
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Xác nhận thanh toán</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Payment Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Thông tin thanh toán</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-blue-800">Mã: {payment.paymentId}</p>
                <p className="text-blue-800">Khách hàng: {payment.tenant.fullName}</p>
                <p className="text-blue-800 font-bold">Số tiền: {formatPrice(payment.amount)}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-900">Chuyển khoản ngân hàng</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Banknote className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-900">Tiền mặt</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Wallet className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-gray-900">Ví điện tử</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="installment"
                    checked={paymentMethod === 'installment'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-gray-900">Thanh toán từ từ</span>
                </label>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú về thanh toán..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paymentToConfirm, setPaymentToConfirm] = useState<Payment | null>(null);

  const { success, error } = useToastContext();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch payments, contracts, rooms, and users
      const [paymentsRes, contractsRes, roomsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/payments?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/contracts?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/rooms?limit=9999', { headers: buildHeaders() }),
        fetch('http://localhost:3000/users?limit=9999', { headers: buildHeaders() })
      ]);

      const [paymentsData, contractsData, roomsData, usersData] = await Promise.all([
        paymentsRes.json(),
        contractsRes.json(),
        roomsRes.json(),
        usersRes.json()
      ]);

      // Combine data
      const enrichedPayments = paymentsData.data.map((payment: any) => {
        // Find tenant by userId (not id)
        const tenant = usersData.data.users.find((u: any) => u.userId === payment.tenantId);

        // Find contract by contractId
        const contract = contractsData.data.contracts.find((c: any) => c.contractId === payment.contractId);

        // Find room by roomId from contract
        const room = contract ? roomsData.data.rooms.find((r: any) => r.roomId === contract.roomId) : null;

        return {
          ...payment,
          tenant: tenant || { fullName: 'Người dùng không tồn tại', email: 'unknown@example.com' },
          contract: {
            ...contract,
            room: room || { roomTitle: 'Phòng không tồn tại', location: 'Không xác định' }
          }
        };
      });

      setPayments(enrichedPayments);
    } catch (err) {
      console.error(err);
      loadPayments()
      error('Lỗi', 'Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.contract.room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.contract.room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.extraNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleConfirmPayment = (payment: Payment) => {
    setPaymentToConfirm(payment);
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = async (paymentId: string, status: 'paid' | 'pending' | 'overdue', method?: string, note?: string) => {
    try {
      const updateData: any = { 
        paymentStatus: status,
        extraNote: note || ''
      };

      const response = await fetch(`http://localhost:3000/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      success('Thành công', 'Cập nhật trạng thái thanh toán thành công');
      await loadPayments();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật trạng thái thanh toán');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPayment(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có thông tin';
    
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.paymentStatus === 'paid').length,
    pending: payments.filter(p => p.paymentStatus === 'pending').length,
    overdue: payments.filter(p => p.paymentStatus === 'overdue').length,
    totalAmount: payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.paymentStatus === 'pending').reduce((sum, p) => sum + p.amount, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-gray-600">Theo dõi và quản lý các giao dịch thanh toán</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng thu</p>
              <p className="text-lg font-bold text-green-600">{formatPrice(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ thu</p>
              <p className="text-lg font-bold text-orange-600">{formatPrice(stats.pendingAmount)}</p>
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
              placeholder="Tìm kiếm theo mã thanh toán, tên khách hàng, phòng trọ, ghi chú..."
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
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách thanh toán ({filteredPayments.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.paymentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {payment.tenant.avatar ? (
                          <img 
                            src={payment.tenant.avatar} 
                            alt={payment.tenant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{payment.tenant.fullName}</div>
                        <div className="text-sm text-gray-500">{payment.tenant.email}</div>
                        {payment.tenant.phone && (
                          <div className="text-sm text-gray-500">{payment.tenant.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.contract.room.roomTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.contract.room.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-lg font-bold text-green-600">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {formatPrice(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(payment.paymentDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <p className="line-clamp-2">{payment.extraNote || 'Chưa có thông tin'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                      {getStatusText(payment.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(payment)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy giao dịch nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        payment={selectedPayment}
      />

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPaymentToConfirm(null);
        }}
        payment={paymentToConfirm}
        onConfirm={(paymentId, note) => {
          handleUpdateStatus(paymentId, 'paid', '', note);
          setIsConfirmModalOpen(false);
          setPaymentToConfirm(null);
        }}
      />
    </div>
  );
};

export default PaymentsPage;