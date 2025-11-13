// ../client/src/pages/host/UpdateRoom.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hostService } from "../../services/hostService";

type RoomBE = {
  _id: string;
  roomId: string;
  roomTitle: string;
  price: number | { value: number; unit: string };
  area: number;
  location: string;
  description?: string;
  images: string[];
  roomType: "single" | "shared" | "apartment";
  status: "available" | "rented" | "maintenance";
  utilities: string[];
  terms?: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  roomTitle: string;
  roomType: "single" | "shared" | "apartment";
  priceValue: number;
  priceUnit: string;
  area: number;
  location: string;
  imagesInput: string;     // mỗi URL 1 dòng hoặc cách bởi dấu phẩy
  utilitiesInput: string;  // "Wifi, Máy lạnh"
  description: string;
  terms: string;
};

const initialForm: FormState = {
  roomTitle: "",
  roomType: "single",
  priceValue: 0,
  priceUnit: "VNĐ/tháng",
  area: 0,
  location: "",
  imagesInput: "",
  utilitiesInput: "",
  description: "",
  terms: "",
};

export default function UpdateRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // helpers
  const toList = (raw: string) =>
    raw.split(/[\n,]+/g).map(s => s.trim()).filter(Boolean);

  const isValidImageUrl = (u: string) =>
    /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(u);

  // load room
  useEffect(() => {
    if (!id) return;
    setInitialLoading(true);
    // service nên nhận string id và trả { success, data }
    hostService.getRoomById(id as any)
      .then(res => {
        const r: RoomBE = res?.data?.data ?? res?.data; // hỗ trợ cả mock
        if (!r?._id) throw new Error("Room not found");

        const priceVal = typeof r.price === "object" ? r.price.value : (r.price ?? 0);
        const priceUnit = typeof r.price === "object" ? (r.price.unit || "VNĐ/tháng") : "VNĐ/tháng";

        setForm({
          roomTitle: r.roomTitle || "",
          roomType: r.roomType || "single",
          priceValue: priceVal,
          priceUnit,
          area: r.area ?? 0,
          location: r.location || "",
          imagesInput: (r.images || []).join("\n"),
          utilitiesInput: (r.utilities || []).join(", "),
          description: r.description || "",
          terms: r.terms || "",
        });
      })
      .catch((e) => {
        console.error(e);
        alert("❌ Không tìm thấy thông tin phòng.");
        navigate("/host/room-list");
      })
      .finally(() => setInitialLoading(false));
  }, [id, navigate]);

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setForm(s => ({
      ...s,
      [name]: name === "priceValue" || name === "area" ? Number(value) : value,
    }) as FormState);
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!id) return;

    // validate
    if (!form.roomTitle.trim()) return alert("Vui lòng nhập tiêu đề phòng.");
    if (form.priceValue <= 0)   return alert("Giá phòng phải > 0.");
    if (form.area <= 0)         return alert("Diện tích phải > 0.");

    const images = toList(form.imagesInput);
    const bad = images.find(u => !isValidImageUrl(u));
    if (bad) return alert(`URL ảnh không hợp lệ: ${bad}`);

    // payload đúng schema BE
    const payload = {
      roomTitle: form.roomTitle,
      roomType: form.roomType,
      price: { value: form.priceValue, unit: form.priceUnit },
      area: form.area,
      location: form.location,
      images,
      utilities: toList(form.utilitiesInput),
      description: form.description,
      terms: form.terms,
      // hostId, status, roomId: không update từ FE
    };

    setLoading(true);
    try {
      // service nên nhận string id
      await hostService.updateRoom(id as any, payload);
      alert("✅ Cập nhật phòng thành công!");
      navigate("/host/room-list");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật phòng thất bại!";
      alert(`❌ ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">🛠 Cập nhật thông tin phòng</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phòng *</label>
              <input
                type="text" name="roomTitle" value={form.roomTitle} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng *</label>
              <select
                name="roomType" value={form.roomType} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
              >
                <option value="single">Phòng đơn</option>
                <option value="shared">Phòng chung</option>
                <option value="apartment">Căn hộ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (value) *</label>
              <input
                type="number" name="priceValue" value={form.priceValue} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị giá (unit)</label>
              <input
                type="text" name="priceUnit" value={form.priceUnit} onChange={onChange} placeholder="VNĐ/tháng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích (m²) *</label>
              <input
                type="number" name="area" value={form.area} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
              <input
                type="text" name="location" value={form.location} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh (mỗi URL 1 dòng hoặc ngăn bởi dấu phẩy)</label>
            <textarea
              name="imagesInput" value={form.imagesInput} onChange={onChange} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`https://example.com/a.jpg\nhttps://example.com/b.png`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiện ích (phân tách dấu phẩy)</label>
            <input
              type="text" name="utilitiesInput" value={form.utilitiesInput} onChange={onChange}
              placeholder="Wifi, Máy lạnh, Máy giặt"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Điều khoản / ghi chú</label>
            <textarea
              name="terms" value={form.terms} onChange={onChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
            <textarea
              name="description" value={form.description} onChange={onChange} rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="button" onClick={() => navigate("/host/room-list")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "💾 Cập nhật phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
