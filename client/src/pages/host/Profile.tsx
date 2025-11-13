// 📁 src/pages/host/Profile.tsx
import { useEffect, useState } from "react";
import { hostService } from "../../services/hostService";
import { User, Phone, Mail, MapPin, Edit, X, Save, Settings } from "lucide-react";
import Modal from "../../components/Modal"; // Modal tự tạo
import UpdateProfile from "./UpdateProfile"; // Form cập nhật thông tin
import { buildHeaders } from "../../utils/config";

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    avatar: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    hostService
      .getProfile()
      .then((res) => {
        setProfile(res.data.data)
        console.log(res.data.data)
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshProfile = () => {
    hostService.getProfile().then((res) => setProfile(res.data.data));
  };

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const closePasswordDialog = () => {
    setShowPasswordDialog(false);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center space-x-6">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
            />
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-2">{profile.fullName}</h1>
              <p className="text-blue-100">Chủ nhà</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin cá nhân
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={16} />
                <span>Chỉnh sửa</span>
              </button>
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Settings size={16} />
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Họ tên</p>
                  <p className="font-medium text-gray-900">{profile.fullName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-900">{profile.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{profile.address}</p>
                </div>
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
        </div>
      </div>

      {/* Modal cập nhật */}
      {isEditing && (
        <Modal onClose={() => setIsEditing(false)}>
          <UpdateProfile
            closeModal={() => {
              setIsEditing(false);
              refreshProfile(); // sau khi cập nhật thì load lại
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Profile;
