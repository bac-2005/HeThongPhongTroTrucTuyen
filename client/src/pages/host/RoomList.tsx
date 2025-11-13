// ../client/src/pages/host/RoomList.tsx
// Danh sách phòng trọ
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hostService } from "../../services/hostService";
import RoomCard from "../../components/RoomCard";
import RoomDetail from "./RoomDetail";
import { Plus, Search, Filter } from "lucide-react";

// Kiểu dữ liệu từ BE
type RoomBE = {
  _id: string;
  roomId: string;
  roomTitle: string;
  price: number | { value: number; unit: string };
  area: number;
  location: string;
  description?: string;
  images: string[];
  roomType: 'single' | 'shared' | 'apartment';
  status: 'available' | 'rented' | 'maintenance';
  utilities: string[];
  terms?: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
};

// Kiểu FE dùng cho UI hiện tại
interface Room {
  id: string;
  roomId: string;                   // map từ _id
  title: string;              // map từ roomTitle
  area: number;
  price: number;              // ép về number
  utilities: string;          // join từ mảng utilities
  image: any;              // ảnh đầu tiên
  description?: string;
  location?: string;
  status: 'Còn trống' | 'Đã cho thuê' | 'Đang sửa chữa';
}

const adaptRoom = (r: RoomBE): Room => ({
  id: r._id,
  title: r.roomTitle,
  roomId: r.roomId,
  area: r.area,
  price: typeof r.price === 'object' ? r.price.value : (r.price ?? 0),
  utilities: (r.utilities || []).join(', '),
  image: r.images || '',
  description: r.description || '',
  location: r.location || '',
  status:
    r.status === 'available' ? 'Còn trống' :
    r.status === 'rented' ? 'Đã cho thuê' :
    r.status === 'maintenance' ? 'Đang sửa chữa' :
    r.status === 'Waiting' ? 'Chờ thanh toán' :
    '',
});

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const navigate = useNavigate();

 const fetchRooms = async () => {
  try {
    setLoading(true);
    const res = await hostService.getRooms(); // axios instance
    // res.data: { success: true, data: { rooms: RoomBE[], pagination: ... } }
    const roomsBE: RoomBE[] = (res?.data?.data?.rooms ?? []).filter((x: any) => x?.status !== "deleted");
    const uiRooms = roomsBE.map(adaptRoom);
    setRooms(uiRooms);
    setFilteredRooms(uiRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
  let filtered = rooms;

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.utilities.toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q)
    );
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter(r => r.status === statusFilter);
  }

  setFilteredRooms(filtered);
}, [searchTerm, statusFilter, rooms]);


  const handleDelete = async (id: string) => {
  if (!window.confirm("❗Bạn có chắc chắn muốn xóa phòng này?")) return;
  try {
    await hostService.deleteRoom(id as any); // hoặc đổi service về string
    fetchRooms();
  } catch (err) {
    alert("❌ Lỗi khi xóa phòng!");
    console.error(err);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách phòng trọ</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả phòng trọ của bạn</p>
        </div>
        <button
          onClick={() => navigate("/host/create-room")}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          <span>Thêm phòng mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phòng hoặc tiện ích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Còn trống">Còn trống</option>
              <option value="Đã cho thuê">Đã cho thuê</option>
              <option value="Đang sửa chữa">Đang sửa chữa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredRooms.length} trong tổng số {rooms.length} phòng
        </p>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all" ? "Không tìm thấy phòng nào" : "Chưa có phòng nào"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Hãy tạo phòng đầu tiên của bạn"
            }
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => navigate("/host/create-room")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Tạo phòng đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onViewDetail={() => setSelectedRoom(room)}
                onEdit={() => navigate(`/host/update-room/${room.roomId}`)}
                onDelete={() => handleDelete(room.roomId)} 
              />

            ))}
        </div>
      )}

      {selectedRoom && (
        <RoomDetail 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </div>
  );
}