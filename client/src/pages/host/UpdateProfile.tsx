// 📁 src/pages/host/UpdateProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hostService } from "../../services/hostService";

type ProfileDTO = {
  fullName: string;
  phone: string;
  email: string;     // chỉ hiển thị, không gửi lên
  avatar: string;
  address: string;
  dob: string;       // yyyy-MM-dd
};

interface UpdateProfileProps {
  closeModal?: () => void;
}

const emptyProfile: ProfileDTO = {
  fullName: "",
  phone: "",
  email: "",
  avatar: "",
  address: "",
  dob: "",
};

const UpdateProfile = ({ closeModal }: UpdateProfileProps) => {
  const [profile, setProfile] = useState<ProfileDTO>(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        // Giả định BE trả { success, data: { userId, fullName, email, phone, avatar, address, dob } }
        const res = await hostService.getProfile();
        const u = res?.data?.data ?? res?.data ?? {};
        setProfile({
          fullName: u.fullName ?? "",
          phone: u.phone ?? "",
          email: u.email ?? "",        // chỉ hiển thị
          avatar: u.avatar ?? "",
          address: u.address ?? "",
          dob: u.dob ? toInputDate(u.dob) : "",
        });
      } catch {
        alert("❌ Không thể tải thông tin profile!");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Gửi ĐÚNG field mà BE nhận
      const payload: Partial<ProfileDTO> = {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        avatar: profile.avatar,
        dob: profile.dob || undefined, // optional
      };
      const data = await hostService.updateProfile(payload);
      localStorage.setItem("user",  JSON.stringify(data.data.data))
      alert("✅ Cập nhật thành công!");
      if (closeModal) closeModal();
      else navigate("/host/profile");
    } catch (error) {
      console.error(error);
      alert("❌ Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center text-blue-600">
        🧑‍💼 Cập nhật thông tin
      </h2>

      <div className="space-y-4">
        {/* fullName */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ tên:
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại:
          </label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* email - chỉ đọc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (không chỉnh sửa tại đây):
          </label>
          <input
            type="email"
            value={profile.email}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
          />
        </div>

        {/* avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện (URL):
          </label>
          <input
            type="text"
            value={profile.avatar}
            onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {profile.avatar && (
          <div className="flex justify-center">
            <img
              src={profile.avatar}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}

        {/* address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ:
          </label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* dob */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày sinh:
          </label>
          <input
            type="date"
            value={profile.dob}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-between space-x-4 mt-6">
          {closeModal && (
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              ❌ Hủy
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "🔄 Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;

// Helpers
function toInputDate(d: string | Date) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
