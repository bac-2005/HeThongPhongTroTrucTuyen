import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/MyAccount.css';
import { userService } from '../../services/userService';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Save,
  X,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Key,
  Receipt,
  CreditCard,
  Calendar,
  Settings,
  History,
  FileText,
  Camera,
  Eye
} from 'lucide-react';
import { buildHeaders } from '../../utils/config';
import { InvoiceListDialog } from './InvoiceListDialog';
import { paymentService } from '../../services/paymentService';
import Modal from "../../components/Modal";
import UpdateProfile from '../host/UpdateProfile';
import { convertStatus } from '../../utils/format';
import CancelContractDialog from './CancelContractDialog';
import PaymentHistoryDialog from './PaymentHistoryDialog';
import ContractDialog from './ContractViewDialog';

type ContractStatus = 'pending' | 'active' | 'expired' | 'terminated';

type ApiContract = {
  _id: string;
  contractId: string;
  bookingId?: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  rentPrice?: number;
  terms?: string;
  status: ContractStatus;
  createdAt?: string;
  updatedAt?: string;
  roomInfo?: {
    roomId: string;
    roomTitle: string;
    price?: { value: number; unit: string };
    location?: string;
    images?: string[];
    hostId?: string;
  };
};

type Row = {
  id: string;
  contractId: string;
  roomId: string;
  roomTitle: string;
  image: string;
  monthlyPrice: number;
  totalPrice: number;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const MyAccount: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenViewContract, setIsOpenViewContract] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [isOpenContract, setIsOpenContract] = useState(false);
  const [contract, setContract] = useState('')

  const openDialog = (id: string) => {
    setContract(id)
    setIsOpenContract(true)
  };

  const closeDialog = () => {
    setContract('')
    setIsOpenContract(false)
    setIsOpenViewContract(false)
  }
  const fetchData = async () => {
    try {
      if (!user?.id) return;

      // Hồ sơ
      const resUser: any = await userService.getUserById(user.id);
      setProfile(resUser.data);

      // Hợp đồng của tenant
      const res = await axios.get('http://localhost:3000/contracts/tenant', {
        headers: buildHeaders(),
      });

      const list: ApiContract[] = res.data?.data?.contracts ?? res.data?.contracts ?? res.data ?? [];

      const adapted: Row[] = list.map((c) => {
        const img = (c.roomInfo?.images && c.roomInfo.images[0]) || '/default-room.jpg';
        const monthly = typeof c.roomInfo?.price?.value === 'number'
          ? c.roomInfo!.price!.value
          : (typeof c.rentPrice === 'number' && c.duration ? Math.floor(c.rentPrice / Math.max(c.duration, 1)) : 0);
        const total = typeof c.rentPrice === 'number'
          ? c.rentPrice!
          : monthly * (c.duration || 1);

        return {
          price: c.roomInfo?.price?.value,
          id: c.contractId || c._id,
          contractId: c.contractId || c._id,
          roomId: c.roomId,
          roomTitle: c.roomInfo?.roomTitle || c.roomId,
          image: img,
          monthlyPrice: monthly || 0,
          totalPrice: total || 0,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
        };
      });

      setRows(adapted);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePay = (contractId: string, amount: number) => {
    navigate(`/payments/contract/${contractId}`, { state: { amount } });
  };

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/auth/password`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đổi mật khẩu thất bại');
      }

      alert('Đổi mật khẩu thành công');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordDialog(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể đổi mật khẩu');
    }
  };

  const closePasswordDialog = () => {
    setShowPasswordDialog(false);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const onPay = async (value: any) => {
    try {
      setLoading(true);
      const data: any = await paymentService.createVnpayPaymentInvoi({
        tenantId: value.userId,
        contractId: value.contractId,
        amount: value.totalAmount,
        extraNote: value.note,
        invoiceId: value.invoiceId,
      });
      window.location.href = data.data.payUrl;
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    setIsOpenViewContract(true)
    setContract(id)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy thông tin</h3>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white/20">
                      <img
                        src={profile?.avatar || 'https://i.pravatar.cc/80'}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Camera className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{profile.fullName}</h2>
                  <p className="text-blue-100 text-sm">{profile.email}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{rows.length}</p>
                    <p className="text-xs text-gray-500">Hợp đồng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(profile.balance || 0).toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-xs text-gray-500">Số dư</p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'profile'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Thông tin cá nhân</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowPasswordDialog(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <Key className="w-5 h-5" />
                      <span className="font-medium">Đổi mật khẩu</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <Receipt className="w-5 h-5" />
                      <span className="font-medium">Thanh toán hóa đơn</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <History className="w-5 h-5" />
                      <span className="font-medium">Lịch sử thanh toán</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/my-bookings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/my-bookings'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Yêu cầu thuê của tôi</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Thông tin cá nhân</h2>
                    <p className="text-gray-600">Quản lý thông tin và hợp đồng của bạn</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{profile.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{profile.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                      <p className="font-semibold text-gray-900">{profile.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                {/* Contract History */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Lịch sử hợp đồng</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      {rows.length} hợp đồng
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    {rows.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Phòng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Giá thuê
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Thời hạn
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                              Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[350px]">
                              Hành động
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {rows.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                      src={r.image}
                                      alt={r.roomTitle}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIGZpbGw9IiNmM2Y0ZjYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMyAyMWgxOFY5TDEyIDJsLTkgN3YxMnptOS00VjloNHY4aC00eiIvPjwvc3ZnPg==';
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{r.roomTitle}</h4>
                                    <p className="text-xs text-gray-500">#{r.contractId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {r.monthlyPrice.toLocaleString('vi-VN')}₫
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Tổng: {r.totalPrice.toLocaleString('vi-VN')}₫
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <p className="text-gray-900">{new Date(r.startDate).toLocaleDateString('vi-VN')}</p>
                                  <p className="text-gray-500">
                                    đến {r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(r.status)}`}>
                                  {convertStatus(r.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {r.status === 'pending' && (
                                    <button
                                      onClick={() => handlePay(r.contractId, r.price)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      Thanh toán
                                    </button>
                                  )}
                                  {r.status === 'active' && (
                                    <button
                                      onClick={() => openDialog(r.contractId)}
                                      className={"inline-flex items-center text-[10px] gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"}
                                    >
                                      Gửi yêu cầu hủy Hợp Đồng
                                    </button>
                                  )}
                                  {!["active", "pending"].includes(r.status) && (
                                    <span className="text-xs text-gray-400 italic">Không có hành động</span>
                                  )}
                                  <button
                                    onClick={() => handleView(r.contractId)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Xem hợp đồng
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hợp đồng</h3>
                        <p className="text-gray-500 text-center">
                          Bạn chưa có hợp đồng thuê phòng nào.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpenContract && <CancelContractDialog isOpen={isOpenContract} onClose={closeDialog} contractId={contract} fetchData={fetchData} />}
      {/* Password Change Dialog */}
      {
        showPasswordDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
                  <button
                    onClick={closePasswordDialog}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={closePasswordDialog}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Dialogs */}
      {
        isDialogOpen && (
          <InvoiceListDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onPayment={onPay}
          />
        )
      }

      {
        isEditing && (
          <Modal onClose={() => setIsEditing(false)}>
            <UpdateProfile
              closeModal={() => {
                setIsEditing(false);
                fetchData();
              }}
            />
          </Modal>
        )
      }

      {
        isOpen && (
          <PaymentHistoryDialog
            isOpen={isOpen}
            closeDialog={() => setIsOpen(false)}
          />
        )
      }
      {isOpenViewContract && (
        <ContractDialog onClose={closeDialog} contractId={contract} />
      )}
    </div >
  );
};

export default MyAccount;