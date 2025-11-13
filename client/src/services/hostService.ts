// 📁 client/src/services/hostService.ts
import axios from "axios";

const API = "http://localhost:3000";

const api = axios.create({
  baseURL: API,
});

// interceptor: tự thêm Authorization vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const hostService = {

  updateRoomStatus: async (
    roomId: string,
    status: 'available' | 'rented' | 'maintenance'
  ) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:3000/rooms/${roomId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || 'Cập nhật trạng thái thất bại');
    }
    return json?.data;
  },

  approveBooking: async (bookingId: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Chưa đăng nhập');

    const res = await fetch(`http://localhost:3000/bookings/${bookingId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Duyệt booking thất bại');
    }
    return data;
  },

  rejectBooking: async (bookingId: string, reason?: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Chưa đăng nhập');

    const res = await fetch(`http://localhost:3000/bookings/${bookingId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Từ chối booking thất bại');
    }
    return data;
  },
  // 1. Cập nhật thông tin cá nhân
  getProfile: () => api.get(`/auth/me`),
  updateProfile: (data: any) => api.put(`/auth/profile`, data),

  // 2. Quản lý trạng thái phòng
  getRoomStatus: () => api.get(`/approvals`),
  // updateRoomStatus: (roomId: number, status: string) =>
  //   api.put(`/approvals/${roomId}`, { status }),

  // 3. Duyệt yêu cầu thuê phòng
  getRentalRequests: () => api.get(`/bookings/host?limit=9999`),
  approveRentalRequest: (id: string) =>
    api.patch(`/rentalRequests/${id}`, { status: "đã duyệt" }),
  rejectRentalRequest: (id: string) =>
    api.patch(`/rentalRequests/${id}`, { status: "đã từ chối" }),

  // ✅ Tạo hợp đồng 
  createContract: (data: any) => api.post(`/contracts`, data),

  // QUẢN LÝ HỢP ĐỒNG
  getContracts: () => api.get(`/contracts/host?limit=9999`),
  getContractsByRoom: (roomId: string) => api.get(`/contracts?roomId=${roomId}`),
  getContractById: (id: string) => api.get(`/contracts/${id}`),
  deleteContract: (id: string) => api.delete(`/contracts/${id}`),

  // Tạo phòng mới
  createRoom: (data: any) => api.post(`/rooms`, data),
  getRooms: () => api.get(`rooms/my/rooms`),
  deleteRoom: (id: number) => api.delete(`/rooms/${id}`),

  // Sửa thông tin phòng
  getRoomById: (id: number) => api.get(`/rooms/${id}`),
  updateRoom: (id: number, data: any) => api.put(`/rooms/${id}`, data),

  hostStatic: (params: any) => api.get(`statistics/host?${params}`),
  adminStatic: (params: any) => api.get(`statistics/admin?${params}`),
  // Statistics
  getStatistics: () => {
    return Promise.all([
      api.get(`/rooms`),
      api.get(`/roomStatus`),
      api.get(`/contracts`),
    ]).then(([roomsRes, statusRes, contractsRes]) => {
      const rooms = roomsRes.data;
      const roomStatus = statusRes.data;
      const contracts = contractsRes.data;

      const totalRooms = rooms.length;
      const rentedRooms = roomStatus.filter((r: any) => r.status === "Đã cho thuê").length;
      const availableRooms = roomStatus.filter((r: any) => r.status === "Trống").length;
      const totalRevenue = rooms.reduce((sum: number, room: any) => sum + (room.price || 0), 0);

      return {
        data: {
          totalRooms,
          rentedRooms,
          availableRooms,
          totalRevenue,
        },
      };
    });
  },
};
