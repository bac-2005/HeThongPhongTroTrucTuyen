import React, { useEffect, useState } from 'react';
import "../../css/BookingRequests.css";

interface RentalRequest {
  id: string;
  roomId: string;
  tenantId: string;
  contractId?: string;
  createdAt: string;
  extendMonths?: number;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestType?: 'booking' | 'cancel';
}

interface Room {
  id: string;
  roomTitle: string;
  location: string;
  hostId?: string;
  images?: string[];
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

const BookingRequests: React.FC = () => {
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, roomsRes, usersRes] = await Promise.all([
          fetch('http://localhost:3000/room_requests'),
          fetch('http://localhost:3000/rooms'),
          fetch('http://localhost:3000/users')
        ]);

        const reqData: RentalRequest[] = await reqRes.json();
        const roomsData: Room[] = await roomsRes.json();
        const usersData: User[] = await usersRes.json();

        const pending = reqData.filter(r => r.status?.toLowerCase() === 'pending');
        setRequests(pending);
        setRooms(roomsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };

    fetchData();
  }, []);

  const getRoom = (roomId: string) => rooms.find(r => r.id === roomId);
  const getTenantInfo = (tenantId: string) => users.find(u => u.id === tenantId);

  const handleAcceptBooking = async (request: RentalRequest) => {
    try {
      await fetch(`http://localhost:3000/room_requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      const startDate = new Date();
      const extendMonths = request.extendMonths || 6;
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + extendMonths);

      const room = getRoom(request.roomId);
      const hostId = room?.hostId || '';

      const newContract = {
        id: 'c' + Date.now(),
        tenantId: request.tenantId,
        hostId,
        roomId: request.roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'accepted',
        terms: 'Hợp đồng có hiệu lực. Thanh toán tiền phòng trước ngày 5 hàng tháng.',
      };

      await fetch('http://localhost:3000/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContract),
      });

      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Lỗi khi chấp nhận:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const handleAcceptCancel = async (request: RentalRequest) => {
    try {
      await fetch(`http://localhost:3000/room_requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (request.contractId) {
        await fetch(`http://localhost:3000/contracts/${request.contractId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended', endDate: new Date().toISOString() }),
        });
      }

      setRequests(prev => prev.filter(r => r.id !== request.id));
      alert('Đã duyệt yêu cầu hủy hợp đồng.');
    } catch (error) {
      console.error('Lỗi khi duyệt hủy:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/room_requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Lỗi khi từ chối:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const bookingRequests = requests.filter(r => !r.requestType || r.requestType === 'booking');
  const cancelRequests = requests.filter(r => r.requestType === 'cancel');

  return (
    <div className="booking-requests-container">
      <div className="booking-column">
        <h2>Yêu cầu thuê phòng chờ duyệt</h2>
        {bookingRequests.length === 0 ? (
          <p>Không có yêu cầu thuê phòng.</p>
        ) : (
          <ul className="booking-list">
            {bookingRequests.map(r => {
              const tenant = getTenantInfo(r.tenantId);
              const room = getRoom(r.roomId);
              const image = room?.images?.[0] || "/default-thumbnail.jpg";

              return (
                <li key={r.id} className="booking-item">
                  <img src={image} alt={room?.roomTitle} className="room-image" />
                  <div className="booking-item-content">
                    <div><strong>Phòng:</strong> {room ? `${room.roomTitle} - ${room.location}` : 'Không rõ'}</div>
                    <div><strong>Ngày gửi yêu cầu:</strong> {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</div>
                    <div><strong>Gia hạn dự kiến:</strong> {r.extendMonths || 'Không rõ'} tháng</div>
                    <div><strong>Người thuê:</strong> {tenant?.fullName || `ID: ${r.tenantId}`}</div>
                    <div><strong>Email:</strong> {tenant?.email || 'Không rõ'}</div>
                    <div><strong>Ghi chú:</strong> {r.note && r.note.trim() !== '' ? r.note : 'Không có'}</div>
                    <div className="actions">
                      <button className="accept" onClick={() => handleAcceptBooking(r)}>Chấp nhận</button>
                      <button className="reject" onClick={() => handleReject(r.id)}>Từ chối</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="booking-column">
        <h2>Yêu cầu hủy hợp đồng</h2>
        {cancelRequests.length === 0 ? (
          <p>Không có yêu cầu hủy hợp đồng.</p>
        ) : (
          <ul className="booking-list">
            {cancelRequests.map(r => {
              const tenant = getTenantInfo(r.tenantId);
              const room = getRoom(r.roomId);
              const image = room?.images?.[0] || "/default-thumbnail.jpg";

              return (
                <li key={r.id} className="booking-item cancel-request">
                  <img src={image} alt={room?.roomTitle} className="room-image" />
                  <div className="booking-item-content">
                    <div><strong>Phòng:</strong> {room ? `${room.roomTitle} - ${room.location}` : 'Không rõ'}</div>
                    <div><strong>Ngày gửi yêu cầu:</strong> {new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                    <div><strong>Người thuê:</strong> {tenant?.fullName || 'Không rõ'}</div>
                    <div><strong>Lý do hủy:</strong> {r.note || 'Không có'}</div>
                    <div className="actions">
                      <button className="accept" onClick={() => handleAcceptCancel(r)}>Duyệt hủy</button>
                      <button className="reject" onClick={() => handleReject(r.id)}>Từ chối</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookingRequests;
