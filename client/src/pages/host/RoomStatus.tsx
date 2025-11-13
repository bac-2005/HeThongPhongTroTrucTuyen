// 📁 src/pages/host/RoomStatus.tsx
import { useEffect, useState } from "react";
import { hostService } from "../../services/hostService";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { convertStatus } from "../../utils/format";

type ApprovalRow = {
  id: string;               
  roomId: string;          
  approvalId: string;        
  approvalStatus: "pending" | "approved" | "rejected";
  internalStatus: string;    
  adminId?: string | null;
  requestedAt?: string | null;
  approvalDate?: string | null;
  updatedAt?: string | null;
  note?: string | null;
};

const RoomStatus = () => {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString("vi-VN") : "—";

  const statusIcon = (s: string) => {
    const v = s.toLowerCase();
    if (v === "approved") return <CheckCircle className="w-4 h-4" />;
    if (v === "rejected") return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />; 
  };

  const statusBadge = (s: string) => {
    const v = s.toLowerCase();
    if (v === "approved") return "bg-green-100 text-green-800";
    if (v === "rejected") return "bg-red-100 text-red-800";
    if (v === "pending")  return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
   
      const res = await hostService.getRoomStatus(); 
      const list: any[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      const adapted: ApprovalRow[] = list.map((x) => ({
        id: String(x._id),
        roomId: String(x.roomId ?? "N/A"),
        approvalId: String(x.approvalId ?? "N/A"),
        approvalStatus: String(x.approvalStatus ?? "pending") as ApprovalRow["approvalStatus"],
        internalStatus: String(x.status ?? "—"),
        adminId: x.adminId ?? null,
        requestedAt: x.requestedAt ?? null,
        approvalDate: x.approvalDate ?? null,
        updatedAt: x.updatedAt ?? null,
        note: x.note ?? null,
      }));
      setRows(adapted);
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách phê duyệt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trạng thái phê duyệt phòng</h1>
        <p className="text-gray-600">Chế độ chỉ xem (read-only) • Hiển thị đầy đủ thông tin từ approvals</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu</h3>
            <p className="text-gray-500">Hiện chưa có phiếu phê duyệt nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Internal Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.roomId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.approvalId}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusBadge(r.approvalStatus)}`}>
                        {statusIcon(r.approvalStatus)}
                        {convertStatus(r.approvalStatus)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusBadge(r.internalStatus)}`}>
                        {statusIcon(r.internalStatus)}
                        {convertStatus(r.internalStatus)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">{r.adminId || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(r.requestedAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(r.approvalDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(r.updatedAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomStatus;
