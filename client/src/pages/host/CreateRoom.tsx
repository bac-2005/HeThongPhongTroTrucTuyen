// ../client/src/pages/host/CreateRoom.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hostService } from "../../services/hostService";

type FormState = {
  roomTitle: string;
  priceValue: any;
  priceUnit: string;     // ví dụ: 'VNĐ/tháng'
  area: any;
  location: string;
  roomType: "single" | "shared" | "apartment";
  imagesInput: string;   // nhập dạng nhiều URL, phân tách bởi dấu phẩy hoặc xuống dòng
  utilitiesInput: string;// nhập dạng: "Wifi, Máy lạnh, Máy giặt"
  description: string;
  terms: string;
};

const initialState: FormState = {
  roomTitle: "",
  priceValue: "",
  priceUnit: "VNĐ/tháng",
  area: "",
  location: "",
  roomType: "single",
  imagesInput: "",
  utilitiesInput: "",
  description: "",
  terms: "",
};

export default function CreateRoom() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]:
        name === "priceValue" || name === "area"
          ? Number(value)
          : (value as any),
    }));
  };

  // tách chuỗi thành mảng, trim và lọc rỗng
  const splitList = (raw: string) =>
    raw
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

  const isValidImageUrl = (u: string) =>
    /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(u);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    // Chuẩn hoá dữ liệu gửi lên đúng schema BE
    const images = splitList(form.imagesInput);
    const invalidImg = images.find((u) => !isValidImageUrl(u));
    if (invalidImg) {
      alert(`URL ảnh không hợp lệ: ${invalidImg}`);
      return;
    }

    if (!form.roomTitle.trim()) {
      alert("Vui lòng nhập tiêu đề phòng (roomTitle).");
      return;
    }
    if (form.priceValue <= 0) {
      alert("Giá phòng phải > 0.");
      return;
    }
    if (form.area <= 0) {
      alert("Diện tích phải > 0.");
      return;
    }

    const payload = {
      roomTitle: form.roomTitle,
      price: { value: form.priceValue, unit: form.priceUnit },
      area: form.area,
      location: form.location,
      description: form.description,
      images,
      roomType: form.roomType,
      utilities: splitList(form.utilitiesInput), // array string
      terms: form.terms,
      // hostId: KHÔNG gửi - server tự set từ token
      // status: để mặc định 'available'
    };

    setLoading(true);
    try {
      await hostService.createRoom(payload);
      alert("✅ Tạo phòng thành công!");
      navigate("/host/room-list");
    } catch (err: any) {
      // cố gắng hiện message từ BE (validation mongoose)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Tạo phòng thất bại!";
      alert(`❌ ${msg}`);
      console.error("Create room error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🏠 Thêm phòng trọ mới
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề phòng (roomTitle) *
              </label>
              <input
                type="text"
                name="roomTitle"
                value={form.roomTitle}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại phòng (roomType) *
              </label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="single">Phòng đơn</option>
                <option value="shared">Phòng chung</option>
                <option value="apartment">Căn hộ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá phòng (value) *
              </label>
              <input
                type="number"
                name="priceValue"
                value={form.priceValue}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị giá (unit)
              </label>
              <input
                type="text"
                name="priceUnit"
                value={form.priceUnit}
                onChange={onChange}
                placeholder="VNĐ/tháng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diện tích (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ (location) *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh phòng (mỗi URL 1 dòng hoặc ngăn bằng dấu phẩy) *
            </label>
            <textarea
              name="imagesInput"
              value={form.imagesInput}
              onChange={onChange}
              rows={3}
              placeholder={`https://example.com/a.jpg\nhttps://example.com/b.png`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Chấp nhận .jpg/.jpeg/.png/.webp/.gif và phải là URL bắt đầu bằng http/https.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiện ích (phân tách dấu phẩy)
            </label>
            <input
              type="text"
              name="utilitiesInput"
              value={form.utilitiesInput}
              onChange={onChange}
              placeholder="Wifi, Máy lạnh, Máy giặt"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điều khoản / ghi chú (terms)
            </label>
            <textarea
              name="terms"
              value={form.terms}
              onChange={onChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => navigate("/host/room-list")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "➕ Thêm phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
