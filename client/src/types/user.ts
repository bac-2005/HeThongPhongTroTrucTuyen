export interface User {
  data: User[];
  
  id: string;
  fullName: string;
  userId: string;
  email: string;
  password: string;
  phone?: string;
  username?: string;
  address?: string;
  idNumber?: string;
  dob?: string;
  role: 'admin' | 'host' | 'tenant' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar?: string;
  otpCode?: string;
  zalo?: string;
}


export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  admins: number;
  hosts: number;
  tenants: number;
  guests: number;
}

export interface UserFilters {
  role?: User['role'] | 'all';
  status?: User['status'] | 'all';
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  idNumber?: string;
  dob?: string;
  role: User['role'];
  avatar?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  status?: User['status'];
}