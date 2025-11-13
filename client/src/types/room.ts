export interface Room {
  id: string;
    roomId: string; // 👈 Thêm dòng này để dùng R001, R002...
  hostId: string;
  roomTitle: string;
  price: number;
  area: number;
  location: string;
  description: string;
  images: string[];
  roomType: 'single' | 'double' | 'apartment' | 'shared';
  status: 'available' | 'rented' | 'maintenance';
  utilities: string[];
  terms: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  createdAt: string;
  dateAdded?: any;
  host?: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface RoomStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface RoomFilters {
  roomType?: Room['roomType'] | 'all';
  status?: Room['status'] | 'all';
  approvalStatus?: Room['approvalStatus'] | 'all';
  hostId?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  searchTerm?: string;
}

export interface CreateRoomData {
  hostId: string;
  roomTitle: string;
  price: number;
  area: number;
  location: string;
  description: string;
  images: string[];
  roomType: Room['roomType'];
  utilities: string[];
  terms: string;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  status?: Room['status'];
  approvalStatus?: Room['approvalStatus'];
}
interface Booking {
  id: string;
  roomId: string;
  tenantId: string;
  bookingDate: string;
  note: string;
  bookingStatus: "pending" | "approved" | "rejected";
  approvalStatus: "approved" | "rejected" | "waiting"; // 👈 Thêm dòng này
  createdAt: string;
  room: {
    roomTitle: string;
    location: string;
    price: number;
    images: string[];
  };
  tenant: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}