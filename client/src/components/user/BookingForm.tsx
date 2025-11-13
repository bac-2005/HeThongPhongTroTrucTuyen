import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/BookingForm.css';
import { useAuth } from '../../contexts/AuthContext';
import { buildHeaders } from '../../utils/config';

interface Room {
  id: string;           // FE id (có thể là roomId)
  roomId?: string;      // mã phòng thực dùng cho BE
  roomTitle: string;
  price: number;
  location: string;
}

interface Contract {
  id: string;
  tenantId: string;
  roomId: string;
  status: 'active' | 'terminated' | 'pending';
}

const BookingForm: React.FC = () => {
  const { roomId: roomIdParam } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [extendMonths, setExtendMonths] = useState(3);
  const [note, setNote] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [hasActiveContract, setHasActiveContract] = useState(false);
  const [hasAnyContract, setHasAnyContract] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomIdParam) return;
      try {
        // BE chạy PORT=5000
        const res = await fetch(`http://localhost:3000/rooms/${roomIdParam}`, {
          headers: buildHeaders()
        });
        const json = await res.json();
        // Chuẩn hoá: chấp nhận {data: {...}} hoặc trả phẳng
        const r = json?.data ?? json;

        const adapted: Room = {
          id: String(r?.roomId ?? r?._id ?? roomIdParam),
          roomId: r?.roomId ?? r?._id ?? roomIdParam,
          roomTitle: r?.roomTitle ?? r?.title ?? 'Phòng',
          price: Number(r?.price.value ?? 0),
          location: String(r?.location ?? r?.address ?? ''),
        };
        setRoom(adapted);
      } catch (err) {
        console.error('Lỗi khi lấy phòng:', err);
      }
    };

    const fetchContracts = async () => {
      if (!currentUserId) return;
      try {
        const res = await fetch(`http://localhost:3000/contracts?tenantId=${currentUserId}`, {
          headers: buildHeaders()
        });
        const json = await res.json();
        const list: Contract[] = json?.data?.contracts ?? json?.data ?? [];
        setContracts(list);
        setHasActiveContract(list.some((c) => c.status === 'active'));
        setHasAnyContract(list.length > 0);
      } catch (err) {
        console.error('Lỗi khi lấy hợp đồng:', err);
      }
    };

    fetchRoom();
    fetchContracts();
  }, [roomIdParam, currentUserId]);

  // helper: tạo startDate (00:00) & endDate (+extendMonths)
  const buildDates = (months: number) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    // thêm months, tự động cuộn năm/tháng
    end.setMonth(end.getMonth() + months);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !currentUserId) return;

    if (hasActiveContract) {
      alert('❌ Bạn đang có hợp đồng đang hoạt động. Không thể đặt thêm.');
      return;
    }

    // roomId BE dùng để findOne({ roomId })
    const roomIdForBE = (room as any).roomId ?? room.id;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Chưa đăng nhập!');
      return;
    }

    const { startDate, endDate } = buildDates(extendMonths);

    try {
      const res = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // cần cho protect()
        },
        body: JSON.stringify({
          roomId: roomIdForBE,
          startDate,
          endDate,
          note: note.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert(`❌ Không có quyền hoặc chưa đăng nhập: ${data.message || res.statusText}`);
        } else if (res.status === 404) {
          alert(`❌ Không tìm thấy phòng: ${data.message || 'Room not found'}`);
        } else {
          alert(`❌ Lỗi đặt phòng: ${data.message || res.statusText}`);
        }
        return;
      }

      alert('✅ Đặt phòng thành công!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Lỗi gửi booking:', error);
      alert('❌ Gửi booking thất bại!');
    }
  };

  return (
    <div className="booking-form-container">
      <h2>Đặt phòng</h2>

      {room && (
        <div className="room-info">
          <p><strong>Tên phòng:</strong> {room.roomTitle}</p>
          <p><strong>Giá thuê:</strong> {room.price.toLocaleString()} VND / tháng</p>
          <p><strong>Địa chỉ:</strong> {room.location}</p>
        </div>
      )}

      {hasAnyContract && !hasActiveContract && (
        <p className="warning">⚠️ Bạn đã từng ký hợp đồng trước đây. Vẫn có thể đặt phòng mới.</p>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <label>Họ và tên:</label>
        <input type="text" value={currentUser?.fullName || ''} disabled />

        <label>Số điện thoại:</label>
        <input type="text" value={currentUser?.phone || ''} disabled />

        <label>Email:</label>
        <input type="email" value={currentUser?.email || ''} disabled />

        <label>Thời hạn hợp đồng dự kiến (tháng):</label>
        <input
          type="number"
          min={1}
          value={extendMonths}
          onChange={(e) => setExtendMonths(Math.max(1, Number(e.target.value)))}
          required
        />

        <label>Ghi chú:</label>
        <textarea
          placeholder="Nhập ghi chú cho chủ trọ (ví dụ: Tôi muốn xem phòng vào cuối tuần)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="submit">Đặt phòng</button>
      </form>
    </div>
  );
};

export default BookingForm;
