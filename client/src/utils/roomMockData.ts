import type { Room } from "../types/room";


export const mockRooms: Room[] = [
  {
    id: 1,
    title: 'Phòng trọ cao cấp gần Đại học Bách Khoa',
    description: 'Phòng trọ đầy đủ tiện nghi, an ninh tốt, gần trường học và khu vực ăn uống sầm uất. Phòng được trang bị đầy đủ nội thất, có ban công thoáng mát.',
    address: '123 Đường Lý Thường Kiệt',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    price: 4500000,
    area: 25,
    roomType: 'single',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'WiFi', 'Bảo vệ 24/7'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    landlordId: 2,
    landlordName: 'Trần Thị Lan',
    landlordPhone: '0901234567',
    landlordEmail: 'lan.tran@example.com',
    status: 'available',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    maxOccupants: 2,
    deposit: 9000000,
    electricityCost: 3500,
    waterCost: 100000,
    internetIncluded: true,
    parkingIncluded: true,
    petAllowed: false
  },
  {
    id: 2,
    title: 'Studio hiện đại trung tâm Quận 1',
    description: 'Studio sang trọng với thiết kế hiện đại, view thành phố tuyệt đẹp. Đầy đủ tiện ích cao cấp, phù hợp cho người trẻ năng động.',
    address: '456 Đường Nguyễn Huệ',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    price: 8500000,
    area: 35,
    roomType: 'studio',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'WiFi', 'Gym', 'Hồ bơi'],
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    landlordId: 4,
    landlordName: 'Phạm Thị Hoa',
    landlordPhone: '0912345678',
    landlordEmail: 'hoa.pham@example.com',
    status: 'rented',
    createdAt: '2024-01-20',
    updatedAt: '2024-02-01',
    maxOccupants: 1,
    deposit: 17000000,
    electricityCost: 4000,
    waterCost: 150000,
    internetIncluded: true,
    parkingIncluded: true,
    petAllowed: true
  },
  {
    id: 3,
    title: 'Phòng chia sẻ giá rẻ Quận Thủ Đức',
    description: 'Phòng chia sẻ rộng rãi, sạch sẽ, phù hợp cho sinh viên. Gần các trường đại học lớn, giao thông thuận tiện.',
    address: '789 Đường Võ Văn Ngân',
    district: 'Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    price: 2200000,
    area: 20,
    roomType: 'shared',
    amenities: ['Điều hòa', 'WiFi', 'Bảo vệ', 'Khu vực nấu ăn chung'],
    images: [
      'https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    landlordId: 2,
    landlordName: 'Trần Thị Lan',
    landlordPhone: '0901234567',
    landlordEmail: 'lan.tran@example.com',
    status: 'available',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
    maxOccupants: 4,
    deposit: 4400000,
    electricityCost: 3000,
    waterCost: 80000,
    internetIncluded: true,
    parkingIncluded: false,
    petAllowed: false
  },
  {
    id: 4,
    title: 'Căn hộ mini Quận 7',
    description: 'Căn hộ mini đầy đủ tiện nghi, có bếp riêng, phòng tắm riêng. Khu vực yên tĩnh, an ninh tốt.',
    address: '321 Đường Nguyễn Thị Thập',
    district: 'Quận 7',
    city: 'TP. Hồ Chí Minh',
    price: 6200000,
    area: 30,
    roomType: 'apartment',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Bếp riêng', 'WiFi', 'Thang máy'],
    images: [
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    landlordId: 4,
    landlordName: 'Phạm Thị Hoa',
    landlordPhone: '0912345678',
    landlordEmail: 'hoa.pham@example.com',
    status: 'maintenance',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
    maxOccupants: 2,
    deposit: 12400000,
    electricityCost: 3800,
    waterCost: 120000,
    internetIncluded: true,
    parkingIncluded: true,
    petAllowed: true
  },
  {
    id: 5,
    title: 'Phòng trọ gia đình Quận Bình Thạnh',
    description: 'Phòng trọ rộng rãi phù hợp cho gia đình nhỏ, có không gian sinh hoạt chung, khu vực nấu ăn.',
    address: '654 Đường Xô Viết Nghệ Tĩnh',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    price: 5800000,
    area: 40,
    roomType: 'apartment',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt', 'WiFi', 'Chỗ đậu xe'],
    images: [
      'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    landlordId: 2,
    landlordName: 'Trần Thị Lan',
    landlordPhone: '0901234567',
    landlordEmail: 'lan.tran@example.com',
    status: 'available',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
    maxOccupants: 3,
    deposit: 11600000,
    electricityCost: 3200,
    waterCost: 100000,
    internetIncluded: true,
    parkingIncluded: true,
    petAllowed: true
  }
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const vietnamDistricts = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
  'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
  'Thủ Đức', 'Quận Bình Tân', 'Hóc Môn', 'Củ Chi', 'Nhà Bè', 'Cần Giờ'
];

export const commonAmenities = [
  'Điều hòa', 'Tủ lạnh', 'Máy giặt', 'WiFi', 'Bảo vệ 24/7', 'Thang máy', 'Chỗ đậu xe',
  'Bếp riêng', 'Phòng tắm riêng', 'Ban công', 'Gym', 'Hồ bơi', 'Khu vực nấu ăn chung',
  'Máy nước nóng', 'Tủ quần áo', 'Bàn học', 'Giường', 'Kệ sách'
];
