import React, { useEffect, useMemo, useState } from 'react';
import '../../css/MyBookings.css';
import { useAuth } from '../../contexts/AuthContext';
import { buildHeaders } from '../../utils/config';

// Kiểu dữ liệu FE sau khi chuẩn hoá
type BookingItem = {
  id: string;               
  bookingCode: string;      
  tenantId: string;
  roomId: string;
  startDate?: string;
  endDate?: string;
  extendMonths?: number;      // tính từ startDate-endDate (nếu có)
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  note?: string;
};

type Room = {
  id: string;                 // map từ room.roomId (ưu tiên) hoặc _id
  roomTitle: string;
  location: string;
  images?: string[];
};

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.id;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // tiện ích: tính số tháng giữa 2 ngày (làm tròn xuống)
  const monthsDiff = (a?: string, b?: string) => {
    if (!a || !b) return undefined;
    const d1 = new Date(a);
    const d2 = new Date(b);
    const years = d2.getFullYear() - d1.getFullYear();
    const months = d2.getMonth() - d1.getMonth();
    const total = years * 12 + months - (d2.getDate() < d1.getDate() ? 1 : 0);
    return total >= 0 ? total : 0;
  };
  const fetchData = async () => {
      try {
        const [bookRes, roomRes] = await Promise.all([
          fetch(`http://localhost:3000/bookings/my-bookings`, { headers: buildHeaders() }),
          fetch(`http://localhost:3000/rooms`, { headers: buildHeaders() }),
        ]);

        const bookJson = await bookRes.json();
        const roomJson = await roomRes.json();
        const rawBookings: any[] = Array.isArray(bookJson)
          ? bookJson
          : Array.isArray(bookJson?.data)
          ? bookJson.data
          : [];

        const adaptedBookings: BookingItem[] = rawBookings.map((x) => {
          const id = String(x?._id ?? x?.bookingId ?? '');
          const s = String(x?.status ?? 'pending') as BookingItem['status'];
          const startDate = x?.startDate;
          const endDate = x?.endDate;

          return {
            id,
            bookingCode: x?.bookingId,
            tenantId: String(x?.tenantId ?? ''),
            roomId: String(x?.roomId ?? x?.room?.roomId ?? x?.room?._id ?? ''),
            startDate,
            endDate,
            extendMonths: monthsDiff(startDate, endDate),
            status: s,
            createdAt: x?.createdAt ?? new Date().toISOString(),
            note: x?.note ?? '',
          };
        });

        const rawRooms: any[] = Array.isArray(roomJson)
          ? roomJson
          : Array.isArray(roomJson?.data)
          ? roomJson.data
          : [];

        const adaptedRooms: Room[] = rawRooms.map((r) => ({
          id: String(r?.roomId ?? r?._id ?? ''),
          roomTitle: String(r?.roomTitle ?? r?.title ?? 'Phòng'),
          location: String(r?.location ?? r?.address ?? ''),
          images: Array.isArray(r?.images) ? r.images : r?.image ? [r.image] : [],
        }));

        setBookings(adaptedBookings);
        setRooms(adaptedRooms);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!tenantId) return;

  
    fetchData();
  }, [tenantId]);

  // map roomId → room nhanh
  const roomMap = useMemo(() => {
    const m = new Map<string, Room>();
    rooms.forEach((r) => m.set(r.id, r));
    return m;
  }, [rooms]);

  const getRoom = (roomId: string) => roomMap.get(roomId);

  const handleCancel = async (id: string) => {
    const ok = window.confirm('Bạn có chắc muốn hủy yêu cầu/booking này không?');
    if (!ok) return;

    try {
      // Tuỳ BE bạn: nếu huỷ booking => DELETE /bookings/:id
      // (Nếu bạn dùng "room_requests" thì đổi endpoint tại đây)
      const res = await fetch(`http://localhost:3000/bookings/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(), // nên chứa Authorization
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Không thể hủy: ${err.message || res.statusText}`);
        return;
      }
       fetchData();
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Lỗi hủy yêu cầu:', error);
      alert('Không thể hủy yêu cầu.');
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="my-bookings-container">
      <h2>Danh sách yêu cầu thuê phòng / Booking của bạn</h2>
      {bookings.length === 0 ? (
        <p>Bạn chưa có booking nào.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => {
            const room = getRoom(b.roomId);
            const imageSrc =
              room?.images && room.images.length > 0
                ? room.images[0]
                : 'https://via.placeholder.com/120x90?text=No+Image';

            return (
              <li key={b.id} className={`booking-item ${b.status}`}>
                {/* <img src={imageSrc} alt={room?.roomTitle || 'Phòng trọ'} className="room-image" /> */}
                <div className="booking-info">
                  <div>
                    <strong>Mã booking:</strong> {b.bookingCode || b.id}
                  </div>
                  <div>
                    <strong>Phòng:</strong>{' '}
                    {room ? `${room.roomTitle} - ${room.location}` : b.roomId}
                  </div>
                  {b.startDate && b.endDate && (
                    <div>
                      <strong>Thời hạn:</strong>{' '}
                      {new Date(b.startDate).toLocaleDateString('vi-VN')} →{' '}
                      {new Date(b.endDate).toLocaleDateString('vi-VN')} (
                      {typeof b.extendMonths === 'number' ? `${b.extendMonths} tháng` : 'N/A'})
                    </div>
                  )}
                  <div>
                    <strong>Ngày gửi:</strong>{' '}
                    {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`status ${b.status}`}>{b.status}</span>
                  </div>
                  {b.note && (
                    <div>
                      <strong>Ghi chú:</strong> {b.note}
                    </div>
                  )}
                  {b.status === 'pending' && (
                    <div className="actions">
                      <button onClick={() => handleCancel(b.bookingCode)}>Hủy</button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
