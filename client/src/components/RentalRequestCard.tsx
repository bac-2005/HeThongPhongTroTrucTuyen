// src/components/RentalRequestCard.tsx
import { Calendar, Phone, MessageCircle } from "lucide-react";

type BackendStatus = "pending" | "approved" | "rejected" | "cancelled";

interface RentalRequestCardProps {
  request: {
    id: string;                 // sửa: string
    tenantName: string;
    phone: string;
    email: string;
    desiredRoomId: string;
    status: BackendStatus;      // sửa: dùng status của BE
    message: string;
    submittedAt: string;        // "dd/mm/yyyy - HH:MM"
    avatar: string;
    roomTitle?: string;         // tuỳ chọn
  };
  onApprove: () => void;
  onReject: () => void;
}

const statusLabel: Record<BackendStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

const statusDotClass: Record<BackendStatus, string> = {
  pending: "bg-yellow-400",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  cancelled: "bg-gray-400",
};

const RentalRequestCard = ({ request, onApprove, onReject }: RentalRequestCardProps) => {
  const [datePart, timePart] = (request.submittedAt || "").split(" - ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <img
          src={request.avatar}
          alt={request.tenantName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{request.tenantName}</h4>
              <p className="text-sm text-gray-600 truncate">
                {request.roomTitle ? `${request.roomTitle} • ${request.desiredRoomId}` : request.desiredRoomId}
              </p>
            </div>
            <div className="text-right">
              {datePart && <span className="text-xs text-gray-500">{datePart}</span>}
              {timePart && <div className="text-xs text-gray-400">{timePart}</div>}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <span className="truncate">{request.phone}</span>
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${statusDotClass[request.status]}`}></span>
              <span>{statusLabel[request.status]}</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 italic">"{request.message}"</p>
            </div>
          </div>

          {request?.roomInfo?.status === "maintenance" && (
            <div className="flex space-x-2 mt-4 justify-center rounded-lg bg-gray-600 text-white font-bold py-2">
              PHÒNG ĐANG SỬA CHỮA
            </div>
          )}
          {request.status === "pending" && request?.roomInfo?.status === "available" && request?.roomInfo?.status !== "maintenance" &&  (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onApprove}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Chấp nhận
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Từ chối
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalRequestCard;
