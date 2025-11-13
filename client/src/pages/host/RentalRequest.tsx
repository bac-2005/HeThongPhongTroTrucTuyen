// 📁 src/pages/host/RentalRequests.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hostService } from "../../services/hostService";
import RentalRequestCard from "../../components/RentalRequestCard";
import { Users, Filter } from "lucide-react";

type ApiBooking = {
  _id?: string;
  id?: string;
  bookingId: string;
  roomId: string;
  tenantId: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt?: string;
  roomInfo?: {
    roomId: string;
    roomTitle: string;
    location: string;
    price?: { value: number; unit: string };
    images?: string[];
  };
  // nếu BE có tenantInfo thì thêm ở đây:
  tenantInfo?: {
    fullName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
};

interface RentalRequest {
  id: string;
  tenantName: string;
  phone: string;
  email: string;
  desiredRoomId: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  message: string;
  submittedAt: string;
  avatar: string;
  roomTitle?: string;
}

const RentalRequests = () => {
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RentalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "cancelled"
  >("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const adapt = (x: ApiBooking): RentalRequest => {
    const id = String(x._id ?? x.id ?? x.bookingId);
    const submittedAt = new Date(x.createdAt).toLocaleDateString("vi-VN") +
      " - " +
      new Date(x.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    // Nếu BE chưa trả tenantInfo, dùng placeholder
    const tenantName = x?.tenantId ?? "Khách thuê";
    const phone = x.tenantInfo?.phone ?? "—";
    const email = x.tenantInfo?.email ?? "—";
    const avatar =
      x.tenantInfo?.avatar ??
      `https://i.pravatar.cc/100?u=${encodeURIComponent(x.tenantId)}`;

    return {
      ...x,
      id,
      tenantName,
      phone,
      email,
      desiredRoomId: x.roomId,
      status: x.status,
      message: x.note || "Tôi muốn thuê phòng này, có thể xem phòng được không?",
      submittedAt,
      avatar,
      roomTitle: x.roomInfo?.roomTitle,
    };
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Giả định: hostService.getHostBookings() gọi GET /bookings/host
      const res = await hostService.getRentalRequests();
      // chấp nhận cả 2 dạng: {success, data: []} hoặc []
      const list: ApiBooking[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      const requestsWithDetails = list.map(adapt);
      setRequests(requestsWithDetails);
      setFilteredRequests(requestsWithDetails);
    } catch (error) {
      console.error("Error fetching rental requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, requests]);

  const handleApprove = async (req: RentalRequest) => {
  const confirm = window.confirm("Bạn có chắc muốn duyệt và tạo hợp đồng?");
  if (!confirm) return;

  try {
    // 1) Duyệt booking
    const approveRes = await hostService.approveBooking(req.id);
    const booking = approveRes?.data ?? approveRes;

    // 2) Chuẩn bị payload tạo hợp đồng
    const startDate = booking?.startDate ?? new Date().toISOString();
    const endDate = booking?.endDate ?? new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString();

   const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const duration = Math.max(
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth()) -
      (d2.getDate() < d1.getDate() ? 1 : 0),
      1
    );

    const monthly = booking?.roomInfo?.price ?? 0;
    console.log("Monthly rent:",  booking?.roomInfo);
    const rentPrice = monthly * duration;

    const payload = {
      roomId: booking.roomId,
      tenantId: booking.tenantId,
      duration,            // số tháng
      rentPrice,            // ✅ tổng tiền thuê
      terms: "Hợp đồng mặc định",
      startDate,
      endDate,
      bookingId: booking.bookingId,
    };


    // 3) Gọi API tạo hợp đồng
    await hostService.createContract(payload);

    alert("✅ Đã duyệt và tạo hợp đồng thành công!");
    navigate("/host/contracts"); // => chuyển sang trang danh sách hợp đồng
  } catch (error) {
    console.error("Lỗi khi duyệt và tạo hợp đồng:", error);
    alert("❌ Lỗi khi duyệt hoặc tạo hợp đồng!");
  } finally {
    fetchRequests(); // refresh danh sách request
  }
};


  const handleReject = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn từ chối?");
    if (!confirm) return;
    try {
      // Giả định endpoint: /bookings/:id/reject
      await hostService.rejectBooking(id);
      alert("Đã từ chối yêu cầu.");
      fetchRequests();
    } catch (error) {
      alert("Lỗi khi từ chối yêu cầu!");
      console.error(error);
    }
  };

  // Map label hiển thị tiếng Việt
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "pending", label: "Chờ duyệt" },
      { value: "approved", label: "Đã duyệt" },
      { value: "rejected", label: "Từ chối" },
      { value: "cancelled", label: "Đã hủy" },
    ] as const,
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê phòng</h1>
        <p className="text-gray-600">Quản lý và phản hồi các yêu cầu thuê phòng từ khách hàng</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredRequests.length} trong tổng số {requests.length} yêu cầu
        </p>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter !== "all" ? "Không có yêu cầu nào" : "Chưa có yêu cầu thuê phòng"}
          </h3>
          <p className="text-gray-500">
            {statusFilter !== "all"
              ? "Thử thay đổi bộ lọc để xem các yêu cầu khác"
              : "Các yêu cầu thuê phòng sẽ hiển thị ở đây"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <RentalRequestCard
              key={request.id}
              request={request}
              onApprove={() => handleApprove(request)}
              onReject={() => handleReject(request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalRequests;
