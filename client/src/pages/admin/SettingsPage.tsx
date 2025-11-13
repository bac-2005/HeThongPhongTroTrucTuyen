import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Database,

  Palette,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { buildHeaders } from '../../utils/config';
import { API_BASE_URL } from '../../services/api';

const SettingsPage: React.FC = () => {
  const { success, error } = useToastContext();

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    error("Lỗi", "User not found");
    return;
  }
  const user = JSON.parse(userStr);

  useEffect(() => {
    loadData()
  }, [userStr])

  const loadData = async () => {
    try {
      const response: any = await fetch(
        `${API_BASE_URL}/users/${user.userId}`,
        {
          method: "GET",
          headers: buildHeaders(),
        }
      );

      const data = await response.json();

      setFormData((pre: any) => ({ ...pre, ...data.data }))
    } catch (err) {
      console.error(err);
    } finally {
    }
  };


  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'system' | 'appearance'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Profile settings
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',

    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,

    // Security settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,

    // System settings
    siteName: 'RentalHub',
    siteDescription: 'Hệ thống quản lý cho thuê trọ',
    maintenanceMode: false,
    allowRegistration: true,

    // Appearance settings
    theme: 'light',
    language: 'vi',
    dateFormat: 'dd/mm/yyyy',
    currency: 'VND'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName?.trim()) {
      error("Lỗi", "Tên không được để trống");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      error("Lỗi", "Email không hợp lệ");
      return false;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      error("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }

    // address và avatar có thể optional → bỏ qua
    return true;
  };

  const handleSaveProfile = async () => {
    try {
      // validate trước khi call API
      if (!validateForm()) return;

      const response = await fetch(`http://localhost:3000/users/${user?.id}`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: formData.avatar,
        }),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");

      success("Thành công", "Cập nhật thông tin cá nhân thành công");
    } catch (err) {
      console.error(err);
      error("Lỗi", "Không thể cập nhật thông tin");
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      error('Lỗi', 'Mật khẩu xác nhận không khớp');
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

      if (!response.ok) throw new Error('Đổi mật khẩu thất bại');

      success('Thành công', 'Đổi mật khẩu thành công');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể đổi mật khẩu');
    }
  };

  const handleSaveSystem = async () => {
    try {
      // API call to update system settings
      success('Thành công', 'Cập nhật cài đặt hệ thống thành công');
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật cài đặt hệ thống');
    }
  };

  const handleSaveAppearance = async () => {
    try {
      // API call to update appearance settings
      success('Thành công', 'Cập nhật giao diện thành công');
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể cập nhật giao diện');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    // { id: 'system', label: 'Hệ thống', icon: Database },
    // { id: 'appearance', label: 'Giao diện', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600">Quản lý cài đặt tài khoản và hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
                  <p className="text-sm text-gray-600">Cập nhật ảnh đại diện của bạn</p>
                  <div className="mt-2">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="URL ảnh đại diện"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}



          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Đổi mật khẩu
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
    after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    />
                  </label>

                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && user?.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt hệ thống</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Chế độ bảo trì</p>
                        <p className="text-sm text-gray-600">Tạm thời tắt website để bảo trì</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.maintenanceMode}
                          onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Định dạng ngày
                        </label>
                        <select
                          value={formData.dateFormat}
                          onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                          <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Đơn vị tiền tệ
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="VND">VND (₫)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>




                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSystem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Giao diện</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chủ đề
                      </label>
                      <select
                        value={formData.theme}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">Sáng</option>
                        <option value="dark">Tối</option>
                        <option value="auto">Tự động</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngôn ngữ
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>


                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAppearance}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}

          {/* Access Denied for non-admin users on system tab */}
          {activeTab === 'system' && user?.role !== 'admin' && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Không có quyền truy cập</p>
              <p className="text-gray-400 text-sm mt-1">Chỉ admin mới có thể truy cập cài đặt hệ thống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;