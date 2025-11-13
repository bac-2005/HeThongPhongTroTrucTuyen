import type { User } from "../types/user";

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Nguyễn Văn Admin',
    email: 'admin@example.com',
    role: 'Admin',
    password: 'admin123',
    createdAt: '2024-01-15',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    email: 'lan.tran@example.com',
    role: 'Chủ trọ',
    password: 'lan123',
    createdAt: '2024-01-20',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    name: 'Lê Văn Minh',
    email: 'minh.le@example.com',
    role: 'Người dùng',
    password: 'minh123',
    createdAt: '2024-01-25',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    name: 'Phạm Thị Hoa',
    email: 'hoa.pham@example.com',
    role: 'Chủ trọ',
    password: 'hoa123',
    createdAt: '2024-02-01',
    status: 'inactive',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    name: 'Võ Văn Đức',
    email: 'duc.vo@example.com',
    role: 'Người dùng',
    password: 'duc123',
    createdAt: '2024-02-05',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));