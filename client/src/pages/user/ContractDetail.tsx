import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../../css/ContractDetail.css';
import { useAuth } from '../../contexts/AuthContext';

interface Contract {
  id: string;
  tenantId: string;
  roomId: string;
  hostId?: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  terms?: string;
}

interface Room {
  id: string;
  roomTitle: string;
  location: string;
  price?: number;
  hostId: string;
}

interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'admin' | 'host' | 'tenant' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [tenant, setTenant] = useState<User | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resContract = await fetch(`http://localhost:3000/contracts/${id}`);
        const contractData: Contract = await resContract.json();
        setContract(contractData);

        const resRoom = await fetch(`http://localhost:3000/rooms/${contractData.roomId}`);
        const roomData: Room = await resRoom.json();
        setRoom(roomData);

        const resTenant = await fetch(`http://localhost:3000/users/${contractData.tenantId}`);
        const tenantData: User = await resTenant.json();
        setTenant(tenantData);

        const hostId = contractData.hostId || roomData.hostId;
        const resHost = await fetch(`http://localhost:3000/users/${hostId}`);
        const hostData: User = await resHost.json();
        setHost(hostData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu hợp đồng:', error);
      }
    };

    fetchData();
  }, [id]);

  const getMonthsBetween = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    );
  };

  const handleRequestCancel = async () => {
    if (!contract || !user) return;
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy hợp đồng');
      return;
    }

    try {
      const cancelRequest = {
        id: 'rr' + Date.now(),
        roomId: contract.roomId,
        tenantId: contract.tenantId,
        contractId: contract.id,
        createdAt: new Date().toISOString(),
        note: cancelReason,
        status: 'pending',
        requestType: 'cancel',
      };

      await fetch('http://localhost:3000/room_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelRequest),
      });

      alert('Đã gửi yêu cầu hủy hợp đồng, chờ chủ trọ duyệt.');
      navigate('/my-contracts');
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu hủy:', error);
      alert('Gửi yêu cầu thất bại.');
    }
  };

  if (!contract) return <div className="contract-detail">Đang tải hợp đồng...</div>;

  const durationMonths = getMonthsBetween(contract.startDate, contract.endDate);

  return (
    <div className="contract-detail">
      <h2>Chi tiết hợp đồng</h2>

      <div className="contract-info">
        <div className="info-row"><strong>Mã hợp đồng:</strong> <span>{contract.id}</span></div>
        <div className="info-row"><strong>Trạng thái:</strong> <span>{contract.status}</span></div>
        <div className="info-row"><strong>Ngày ký hợp đồng:</strong> <span>{new Date(contract.startDate).toLocaleDateString()}</span></div>
        <div className="info-row"><strong>Ngày kết thúc:</strong> <span>{new Date(contract.endDate).toLocaleDateString()}</span></div>
        <div className="info-row"><strong>Thời hạn hợp đồng:</strong> <span>{durationMonths} tháng</span></div>
      </div>

      {room && (
        <div className="room-info">
          <h3>Thông tin phòng</h3>
          <div className="info-row"><strong>Tên phòng:</strong> <span>{room.roomTitle}</span></div>
          <div className="info-row"><strong>Địa chỉ:</strong> <span>{room.location}</span></div>
          <div className="info-row"><strong>Giá thuê phòng:</strong> <span>{room.price?.toLocaleString()} VNĐ/tháng</span></div>
        </div>
      )}

      {tenant && host && (
        <div className="user-info">
          <div className="user-card">
            <h4>Người thuê</h4>
            <div className="info-row"><strong>Họ tên:</strong> <span>{tenant.fullName}</span></div>
            <div className="info-row"><strong>SĐT:</strong> <span>{tenant.phone || 'Chưa có'}</span></div>
          </div>
          <div className="user-card">
            <h4>Bên cho thuê</h4>
            <div className="info-row"><strong>Họ tên:</strong> <span>{host.fullName}</span></div>
            <div className="info-row"><strong>SĐT:</strong> <span>{host.phone || 'Chưa có'}</span></div>
          </div>
        </div>
      )}

      <Link to="/my-contracts" className="back-button">Quay lại</Link>

      {contract.status === 'accepted' && user?.id === contract.tenantId && (
        <div className="cancel-contract">
          {!showCancelForm ? (
            <button onClick={() => setShowCancelForm(true)} className="cancel-button">
              Yêu cầu hủy hợp đồng
            </button>
          ) : (
            <div className="cancel-form">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy hợp đồng..."
              />
              <button onClick={handleRequestCancel}>Gửi yêu cầu</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
