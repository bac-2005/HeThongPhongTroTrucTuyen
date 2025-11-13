// 📁 src/pages/host/ContractCreate.tsx
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hostService } from "../../services/hostService";

type FormState = {
  roomId: string;       // VD: "room202" -> STRING, KHÔNG parseInt
  tenantId: string;     // VD: "user_6294f45f"
  duration: string;     // tháng (string để bind input)
  rentPrice: string;    // VNĐ/tháng (string)
  startDate: string;    // yyyy-MM-dd (from input[type=date])
  terms: string;
};

const addMonthsIso = (yyyyMmDd: string, months: number) => {
  // yyyy-MM-dd -> Date (local) -> add months -> ISO
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(y, (m - 1), d);
  dt.setMonth(dt.getMonth() + months);
  return dt.toISOString();
};

const formatDateVN = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

const genBookingId = () => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const d = new Date();
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${ts}-${rand}`;
};

const calcEndDate = (start: string, months: number) => {
  const dt = new Date(start);
  dt.setMonth(dt.getMonth() + months);
  return dt.toISOString();
};

const CreateContract = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<FormState>({
    roomId:   location.state?.roomId   || "",
    tenantId: location.state?.tenantId || "",
    duration: location.state?.duration?.toString?.() || "1",
    rentPrice: location.state?.rentPrice?.toString?.() || "",
    startDate: "",
    terms: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Tính endDate (ISO) để preview và gửi
  const endDateIso = useMemo(() => {
    const months = Number(form.duration);
    if (!form.startDate || !Number.isFinite(months) || months <= 0) return "";
    try {
      return addMonthsIso(form.startDate, months);
    } catch {
      return "";
    }
  }, [form.startDate, form.duration]);

  const validate = () => {
    if (!form.roomId.trim()) return "Vui lòng nhập mã phòng (VD: room202).";
    if (!form.tenantId.trim()) return "Vui lòng nhập tenantId (VD: user_6294f45f).";
    const duration = Number(form.duration);
    if (!Number.isFinite(duration) || duration <= 0) return "Thời hạn (tháng) phải > 0.";
    const rent = Number(form.rentPrice);
    if (!Number.isFinite(rent) || rent <= 0) return "Giá thuê (VNĐ/tháng) phải > 0.";
    if (!form.startDate) return "Vui lòng chọn ngày bắt đầu.";
    if (!form.terms.trim()) return "Vui lòng nhập điều khoản hợp đồng.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const startIso = new Date(form.startDate).toISOString();
  const endIso = calcEndDate(form.startDate, Number(form.duration));
  const bookingId = genBookingId();

  const payload = {
    roomId: form.roomId.trim(),
    tenantId: form.tenantId.trim(),
    duration: Number(form.duration),
    rentPrice: Number(form.rentPrice),
    terms: form.terms.trim(),
    startDate: startIso,
    endDate: endIso,           // ✅ thêm
    bookingId                  // ✅ thêm
  };

  try {
    await hostService.createContract(payload);
    alert("✅ Tạo hợp đồng thành công!");
    navigate("/host/contracts");
  } catch (err) {
    alert("❌ Tạo hợp đồng thất bại!");
    console.error(err);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">📝 Tạo Hợp Đồng Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* roomId */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Mã phòng (roomId) *</label>
              <input
                name="roomId"
                value={form.roomId}
                onChange={onChange}
                placeholder="VD: room202"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* tenantId */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👤 Người thuê (tenantId) *</label>
              <input
                name="tenantId"
                value={form.tenantId}
                onChange={onChange}
                placeholder="VD: user_6294f45f"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⏳ Thời hạn (tháng) *</label>
              <input
                name="duration"
                value={form.duration}
                onChange={onChange}
                type="number"
                min={1}
                step={1}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* rentPrice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💰 Giá thuê (VNĐ/tháng) *</label>
              <input
                name="rentPrice"
                value={form.rentPrice}
                onChange={onChange}
                type="number"
                min={0}
                required
                placeholder="VD: 2800000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* startDate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Ngày bắt đầu *</label>
              <input
                name="startDate"
                value={form.startDate}
                onChange={onChange}
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* endDate (preview - read only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Ngày kết thúc (tự tính)</label>
              <input
                value={endDateIso ? formatDateVN(endDateIso) : ""}
                readOnly
                placeholder="—"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>
          </div>

          {/* terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📄 Điều khoản hợp đồng *</label>
            <textarea
              name="terms"
              value={form.terms}
              onChange={onChange}
              rows={6}
              required
              placeholder="Ví dụ: Tiền nhà thanh toán đầu tháng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/host/contracts")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "✅ Tạo Hợp Đồng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
