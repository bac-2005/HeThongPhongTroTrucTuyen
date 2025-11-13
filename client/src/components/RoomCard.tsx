// src/components/RoomCard.tsx
import { useMemo, useState } from "react";
import { MapPin, Users, Zap } from "lucide-react";
// Nếu bạn đã có hostService.updateRoomStatus thì import dùng cho gọn.
// Hoặc dùng fetch trực tiếp như trong handleSave bên dưới.
import { hostService } from "../services/hostService";

type StatusCode = "available" | "rented" | "maintenance";

const LABEL_TO_CODE: Record<string, StatusCode> = {
  "Còn trống": "available",
  "Đã cho thuê": "rented",
  "Đang sửa chữa": "maintenance",
};

const CODE_TO_LABEL: Record<StatusCode, string> = {
  available: "Còn trống",
  rented: "Đã cho thuê",
  maintenance: "Đang sửa chữa",
};

interface RoomCardData {
  id: string | number;
  roomId: string;                 // cần để gọi API
  code?: string;                  // bạn đang dùng room.code trong UI cũ
  title?: string;                 // còn list map theo title → hỗ trợ cả 2
  area: number;
  price: number;
  utilities: string;
  maxPeople: number;
  image: any;
  status: "Còn trống" | "Đã cho thuê" | "Đang sửa chữa";
}

interface RoomCardProps {
  room: RoomCardData;
  onViewDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusUpdated?: (newLabel: RoomCardData["status"], newCode: StatusCode) => void;
}

const RoomCard = ({ room, onViewDetail, onEdit, onDelete, onStatusUpdated }: RoomCardProps) => {
  const [saving, setSaving] = useState(false);

  // Tiêu đề hiển thị: ưu tiên code, fallback title
  const displayTitle = useMemo(() => room.code ?? room.title ?? "", [room]);

  // Trạng thái hiển thị & bản nháp để chọn
  const [statusLabel, setStatusLabel] = useState<RoomCardData["status"]>(room.status);
  const [draft, setDraft] = useState<StatusCode>(LABEL_TO_CODE[room.status]);

  const getStatusColor = (label: string) => {
    switch (label) {
      case "Đã cho thuê":
        return "bg-green-100 text-green-800";
      case "Còn trống":
        return "bg-yellow-100 text-yellow-800";
      case "Đang sửa chữa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Cách 1: dùng service (khuyến nghị)
      await hostService.updateRoomStatus(room.roomId, draft);

      // Cách 2: fetch thẳng (nếu không dùng service)
      // const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      // const res = await fetch(`http://localhost:5000/rooms/${room.roomId}/status`, {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: token ? `Bearer ${token}` : "",
      //   },
      //   body: JSON.stringify({ status: draft }),
      // });
      // const json = await res.json();
      // if (!res.ok) throw new Error(json?.message || "Cập nhật trạng thái thất bại");

      const newLabel = CODE_TO_LABEL[draft] as RoomCardData["status"];
      setStatusLabel(newLabel);
      onStatusUpdated?.(newLabel, draft);
      alert("✅ Cập nhật trạng thái thành công");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "❌ Cập nhật trạng thái thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img src={room.image?.[0]} alt={displayTitle} className="w-full h-48 object-cover" />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusLabel)}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{displayTitle}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{room.area}m²</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span>Tối đa {room.maxPeople} người</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="w-4 h-4 mr-1" />
            <span className="truncate">{room.utilities}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-lg font-bold text-blue-600">
            {room.price.toLocaleString()}đ/tháng
          </p>
        </div>

        {/* Bộ điều khiển trạng thái */}
        <div className="mb-4 flex items-center gap-2">
          Cập nhật trạng thái:
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value as StatusCode)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=""></option>
            <option value="available">Còn trống</option>
            <option value="rented">Đã cho thuê</option>
            <option value="maintenance">Đang sửa chữa</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
        {/* 
        {room.tenant && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <img
              src={room.tenant.avatar}
              alt={room.tenant.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {room.tenant.name}
              </p>
              <p className="text-xs text-gray-500">{room.tenant.phone}</p>
            </div>
          </div>
        )} */}

        <div className="flex space-x-2">
          <button
            onClick={onViewDetail}
            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
          >
            Chi tiết
          </button>
          <button
            onClick={onEdit}
            className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-100 transition"
          >
            Sửa
          </button>
          {room?.status !== 'Đã cho thuê' && <button
            onClick={onDelete}
            className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition"
          >
            Xóa
          </button>}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
