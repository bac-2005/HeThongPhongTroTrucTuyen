import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../css/UserProfile.css';
import { userService } from '../../services/userService';
import { roomService } from '../../services/roomService';

import type { User } from '../../types/user';

interface Room {
  id: string;
  title: string;
  price: any;
  address: string;
  images: string;
  hostId: string;
  roomId: string;
  location: string;
  host: any;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [host, setHost] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, roomsRes] = await Promise.all([
          userService.getUserById(userId || ''),
          roomService.getRooms(),
        ]);

        setHost(userRes.data);
        console.log(roomsRes);

        const hostRooms = roomsRes.data.filter((room: Room) => room.hostId === userId || room.host?.userId === userId);
        setRooms(hostRooms);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };

    fetchData();
  }, [userId]);

  if (!host) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  return (
    <div className="user-profile-container">
      <div className="user-info">
        <div className="user-info-left">
          <img src={host.avatar || '/default-avatar.png'} alt={host.fullName} className="avatar" />
          <div className="user-info-text">
            <h2>Tên :   {host.fullName}</h2>
            <div className="contact-info">
              <p> 📞<a href={`tel:${host.phone}`}>{host.phone}</a></p>
              {host.zalo && (
                <p>💬<a href={host.zalo} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a></p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="user-rooms">
        <h3>Các phòng đã đăng</h3>
        <div className="room-list">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Link to={`/posts/${room.roomId}`} key={room.roomId} className="post-card1-link">
                <div className="post-card1">
                  <img
                    src={(room.images?.[0]) || '/default-thumbnail.jpg'}
                    alt={room.title}
                    className="thumbnail"
                  />
                  <div className="details">
                    <h4>{room.title}</h4>
                    <p className="price">{room.price.value.toLocaleString()} VNĐ/tháng</p>
                    <p className="address">{room.location}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Người dùng này chưa đăng phòng nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
