import { useEffect, useMemo, useState } from "react";
import { hostService } from "../../services/hostService";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Eye, Trash2, Filter, Edit, XCircle } from "lucide-react";
import InvoiceManagementDialog from "./InvoiceManagementDialog";
import { buildHeaders } from "../../utils/config";
import { convertStatus } from "../../utils/format";
import CancelContractHostDialog from "./CancelContractHostDialog";

type ApiContract = {
  _id: string;
  contractId: string;
  roomId: string;
  tenantId: string;
  duration?: number;
  rentPrice?: number;
  terms?: string;
  startDate?: string;
  contractDate?: string;
  status?: string;
  createdAt?: string;
  roomInfo?: {
    _id: string;
    roomId: string;
    roomTitle: string;
    location: string;
  } | null;
  tenantInfo?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    userId: string;
  } | null;
  bookingInfo?: any;
};

interface ContractRow {
  id: string;
  title: string;
  tenantName: string;
  phone: string;
  roomId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  terms: string;
  status: string;
  location: string;
  tenantId?: string;
}

const fmtVND = (n: number) =>
  (n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const toDate = (iso?: string) => (iso ? new Date(iso) : undefined);

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const fmtDate = (d?: Date) =>
  d ? d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

const statusColor = (s?: string) => {
  switch ((s ?? "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
    case "expired":
    case "ended":
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

// Map từ API -> Row UI
const mapContracts = (list: ApiContract[]): ContractRow[] => {
  return (list ?? []).map((c) => {
    const startIso = c.startDate ?? c.contractDate;
    const start = toDate(startIso);
    const months = Number.isFinite(c.duration as number) ? Number(c.duration) : 0;
    const end = start && months > 0 ? addMonths(start, months) : undefined;

    return {
      id: c.contractId,
      title: c.roomInfo?.roomTitle ?? "",
      tenantName: c.tenantInfo?.fullName ?? "",
      phone: c.tenantInfo?.phone ?? "",
      roomId: c.roomId,
      startDate: fmtDate(start),
      endDate: fmtDate(end),
      deposit: Number(c.rentPrice / c.duration) ?? 0,
      terms: c.terms ?? "",
      status: c.status ?? "",
      location: c.roomInfo?.location ?? "",
      tenantId: c.tenantId ?? "",
    };
  });
};

const ContractList = () => {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [item, setItem] = useState<any>(null);
  // lọc
  const [filterRoomId, setFilterRoomId] = useState("");
  const [keyword, setKeyword] = useState("");

  // phân trang FE
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // ⬅️ kích thước trang FE

  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // BE trả all (không phân trang)
      const res = await hostService.getContracts();
      const rawContracts: ApiContract[] = res?.data?.data?.contracts ?? res?.data?.contracts ?? res?.data ?? [];
      setContracts(mapContracts(rawContracts));
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Reset trang khi đổi filter/keyword/pageSize
  useEffect(() => {
    setPage(1);
  }, [filterRoomId, keyword, pageSize]);

  // lọc client
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return (contracts ?? []).filter((c) => {
      if (filterRoomId.trim() && c.roomId !== filterRoomId.trim()) return false;
      if (!kw) return true;
      const hay = `${c.tenantName} ${c.phone} ${c.roomId} ${c.location} ${c.title}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [contracts, keyword, filterRoomId]);

  // tính trang
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, totalPages);
  const startIndex = (curPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paged = filtered.slice(startIndex, endIndex);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa hợp đồng này?");
    if (!confirmDelete) return;

    try {
      await hostService.deleteContract(id);
      alert("Đã xóa hợp đồng.");
      // Cập nhật danh sách trong bộ nhớ
      const after = contracts.filter((x) => x.id !== id);
      setContracts(after);

      // Nếu trang hiện tại rỗng sau khi xoá -> lùi 1 trang (nếu có)
      const totalAfter = (filterRoomId || keyword)
        ? after.filter((c) => {
          const roomOk = filterRoomId ? c.roomId === filterRoomId : true;
          const kw = keyword.trim().toLowerCase();
          const kwOk = kw ? `${c.tenantName} ${c.phone} ${c.roomId} ${c.location} ${c.title}`.toLowerCase().includes(kw) : true;
          return roomOk && kwOk;
        }).length
        : after.length;

      const totalPagesAfter = Math.max(1, Math.ceil(totalAfter / pageSize));
      setPage((p) => Math.min(p, totalPagesAfter));
    } catch (error) {
      alert("Lỗi khi xóa hợp đồng!");
      console.error(error);
    }
  };
  const handleApprove = async (contractId: string) => {
    try {

      const response = await fetch(`http://localhost:3000/contracts/${contractId}/terminated`, {
        method: 'PUT',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi duyệt hợp đồng');
      }
    } catch (error) {

    } finally {
      fetchContracts();
    }
  }
  const onClearFilters = () => {
    setFilterRoomId("");
    setKeyword("");
    setPage(1);
  };

  const canPrev = curPage > 1;
  const canNext = curPage < totalPages;
  const [isOpen, setIsOpen] = useState(false);
  const [contract, setContract] = useState('')

  const openDialog = (id: string) => {
    setContract(id)
    setIsOpen(true)
  };

  const closeDialog = () => {
    setContract('')
    setIsOpen(false)
  }
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách hợp đồng</h1>
        <p className="text-gray-600">Quản lý tất cả hợp đồng thuê phòng</p>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-sm">Bộ lọc</span>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Search className="text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã phòng, địa điểm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 text-sm whitespace-nowrap">
              Lọc theo mã phòng:
            </label>
            <input
              type="text"
              placeholder="VD: room202"
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="px-3 py-2 w-[160px] border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 text-sm whitespace-nowrap">Mỗi trang:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onClearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && paged.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hợp đồng nào</h3>
          <p className="text-gray-500">Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}

      {/* Table */}
      {!loading && paged.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>ID</Th>
                  <Th>Người thuê</Th>
                  <Th>SĐT</Th>
                  <Th>Phòng</Th>
                  <Th>Địa điểm</Th>
                  <Th>Thời gian</Th>
                  <Th>Tiền cọc/Thuê</Th>
                  <Th>Trạng thái</Th>
                  <Th>Hành động</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paged.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td>
                      <div className="font-semibold text-gray-900">#{c.id}</div>
                      {c.title && <div className="text-xs text-gray-500">{c.title}</div>}
                    </Td>
                    <Td>
                      <div className="text-sm font-medium text-gray-900">{c.tenantName}</div>
                      <div className="text-xs text-gray-400">{c.terms}</div>
                    </Td>
                    <Td className="text-gray-600">{c.phone}</Td>
                    <Td className="text-gray-600">{c.roomId}</Td>
                    <Td className="text-gray-600">{c.location}</Td>
                    <Td className="text-gray-600">
                      <div>{c.startDate || "-"}</div>
                      <div className="text-xs text-gray-400">đến {c.endDate || "-"}</div>
                    </Td>
                    <Td>
                      <span className="text-sm font-medium text-green-600">{fmtVND(c.deposit)}</span>
                    </Td>
                    <Td>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColor(c.status)}`}>
                        {convertStatus(c.status) || "—"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/host/contracts/${encodeURIComponent(c.id)}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log(c);

                            setItem({
                              contractId: c.id,
                              roomId: c.roomId,
                              userId: c.tenantId,
                            })
                            setShowDialog(true)
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                          title="Hóa đơn"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Hóa đơn</span>
                        </button>
                        {/* <button
                          onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900"
                          title="Xóa hợp đồng"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button> */}
                        {c.status === "cancel" &&
                          <button
                            onClick={() => openDialog(c.id)}
                            className={"flex items-center gap-1 text-yellow-600 hover:text-yellow-900"}
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy Hợp Đồng
                          </button>
                        }
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isOpen && <CancelContractHostDialog isOpen={isOpen} onClose={closeDialog} contractId={contract} fetchData={fetchContracts} />}
          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Trang <b>{curPage}</b> / {totalPages} — Hiển thị {startIndex + 1}-{endIndex} / {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${canPrev
                  ? "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
              >
                Trước
              </button>
              <button
                disabled={!canNext}
                onClick={() => canNext && setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${canNext
                  ? "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
      {showDialog && <InvoiceManagementDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        contractId={item.contractId}
        roomId={item.roomId}
        userId={item.userId}
        onInvoiceCreated={(invoice: any) => {
          console.log('Invoice created:', invoice);
        }}
      />}
    </div>
  );
};

// ====== Sub components nhỏ cho gọn JSX ======
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    {children}
  </th>
);
const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>{children}</td>
);

export default ContractList;
