import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/MyAccount.css';
import { userService } from '../../services/userService';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X } from 'lucide-react'; // Import icons for the dialog
import { buildHeaders } from '../../utils/config';
import { InvoiceListDialog } from './InvoiceListDialog';
import { paymentService } from '../../services/paymentService';
import Modal from "../../components/Modal"; // Modal tự tạo
import UpdateProfile from '../host/UpdateProfile';
import { convertStatus } from '../../utils/format';
import CancelContractDialog from './CancelContractDialog';
import PaymentHistoryDialog from './PaymentHistoryDialog';

type ContractStatus = 'pending' | 'active' | 'expired' | 'terminated';

type ApiContract = {
  _id: string;
  contractId: string;
  bookingId?: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  duration?: number;          // tháng
  rentPrice?: number;         // tổng kỳ thuê
  terms?: string;
  status: ContractStatus;
  createdAt?: string;
  updatedAt?: string;
  roomInfo?: {
    roomId: string;
    roomTitle: string;
    price?: { value: number; unit: string }; // có thể có / hoặc không
    location?: string;
    images?: string[];
    hostId?: string;
  };
};

type Row = {
  id: string;                // dùng contractId
  contractId: string;
  roomId: string;
  roomTitle: string;
  image: string;
  monthlyPrice: number;      // giá / tháng
  totalPrice: number;        // rentPrice tổng
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
  const location = useLocation();
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

      const list: ApiContract[] =
        res.data?.data?.contracts ??
        res.data?.contracts ??
        res.data ??
        [];

      const adapted: Row[] = list.map((c) => {
        const img =
          (c.roomInfo?.images && c.roomInfo.images[0]) ||
          '/default-room.jpg';
        const monthly = typeof c.roomInfo?.price?.value === 'number'
          ? c.roomInfo!.price!.value
          : (typeof c.rentPrice === 'number' && c.duration ? Math.floor(c.rentPrice / Math.max(c.duration, 1)) : 0);
        const total = typeof c.rentPrice === 'number'
          ? c.rentPrice!
          : monthly * (c.duration || 1);

        return {
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
    // tuỳ flow của bạn:
    // 1) Điều hướng tới trang thanh toán riêng:
    navigate(`/payments/contract/${contractId}`, { state: { amount } });

    // 2) Hoặc call API tạo payment rồi điều hướng (nếu đã có paymentService)
    // await paymentService.createPayment({ contractId, amount })
    // navigate('/payments/checkout/:paymentId')
  };


  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordDialog(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể đổi mật khẩu');
    }
  };

  const closePasswordDialog = () => {
    setShowPasswordDialog(false);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (loading) return <div className="loading-text">Loading...</div>;
  if (!profile) return <div className="loading-text">Không tìm thấy thông tin tài khoản</div>;

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
      // // Redirect user sang VNPay
      console.log(data.data.payUrl);

      window.location.href = data.data.payUrl;
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="myaccount-container">
      <div className="myaccount-sidebar">
        <img
          src={profile?.avatar || 'https://i.pravatar.cc/40'}
          alt="avatar"
          className="myaccount-avatar"
        />
        <h2 className="myaccount-name">{profile.fullName}</h2>
        <p className="myaccount-phone">📞 {profile.phone || 'Chưa cập nhật'}</p>
        <p className="myaccount-balance">Số dư: {profile.balance?.toLocaleString('vi-VN') || 0} VND</p>

        <ul className="myaccount-menu">
          <li className="active">Thông tin cá nhân</li>
          <li onClick={() => setShowPasswordDialog(true)}>Đổi mật khẩu</li>
          <li onClick={() => setIsDialogOpen(true)}>Thanh toán hóa đơn</li>
          <li onClick={() => setIsOpen(true)}>Lịch sử thanh toán</li>
          <li
            onClick={() => navigate('/my-bookings')}
            className={location.pathname === '/my-bookings' ? 'active' : ''}
            title="Xem các booking của tôi"
          >
            My - Booking
          </li>
        </ul>
      </div>

      <div className="myaccount-main">
        <div className="myaccount-header">
          <h2>Thông tin cá nhân</h2>
          <button className="btn-edit" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
        </div>

        <div className="myaccount-info-grid">
          <div>
            <p className="label">Họ và tên</p>
            <p className="value">{profile.fullName}</p>
          </div>
          <div>
            <p className="label">Số điện thoại</p>
            <p className="value">{profile.phone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <p className="label">Email</p>
            <p className="value">{profile.email}</p>
          </div>
          <div>
            <p className="label">Địa chỉ</p>
            <p className="value">{profile.address || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="myaccount-history">
          <h3>Lịch sử hợp đồng</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Phòng</th>
                  <th>Giá / tháng</th>
                  <th>Tổng kỳ thuê</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <img
                          src={r.image}
                          alt={r.roomTitle}
                          className="room-img"
                        />
                      </td>
                      <td>{r.roomTitle}</td>
                      <td>{r.monthlyPrice.toLocaleString('vi-VN')} VND</td>
                      <td>{r.totalPrice.toLocaleString('vi-VN')} VND</td>
                      <td>{new Date(r.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className={`status ${r.status}`}>{convertStatus(r.status)}</td>
                      <td>
                        {r.status === 'pending' && (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-small shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center"
                            onClick={() => handlePay(r.contractId, r.totalPrice)}
                          >
                            Thanh toán
                          </button>
                        )}

                        {r.status === 'active' && (
                          <CancelContractDialog contractId={r.contractId} fetchData={fetchData} />
                        )}
                        {!["active", "pending"].includes(r.status) && (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-data">Chưa có hợp đồng</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
              <button
                onClick={closePasswordDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Đổi mật khẩu
                </button>
                <button
                  onClick={closePasswordDialog}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDialogOpen && <InvoiceListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPayment={onPay}
      />}

      {/* Modal cập nhật */}
      {isEditing && (
        <Modal onClose={() => setIsEditing(false)}>
          <UpdateProfile
            closeModal={() => {
              setIsEditing(false);
              fetchData(); // sau khi cập nhật thì load lại
            }}
          />
        </Modal>
      )}
      {isOpen && <PaymentHistoryDialog isOpen={isOpen} closeDialog={() => setIsOpen(false)} />}
    </div>
  );
};

export default MyAccount