# Hệ thống thuê phòng trọ Backend

Hệ thống backend hoàn chỉnh cho việc quản lý thuê phòng trọ được xây dựng với Node.js, Express và MongoDB.

## 🚀 Tính năng chính

### Quản lý người dùng
- Đăng ký/Đăng nhập với JWT authentication
- Phân quyền đa cấp (guest, tenant, host, admin)
- Quản lý profile và thay đổi mật khẩu
- Hệ thống vai trò và quyền hạn

### Quản lý phòng trọ
- CRUD operations cho phòng trọ
- Tìm kiếm và lọc nâng cao
- Upload và quản lý hình ảnh
- Hệ thống duyệt phòng bởi admin

### Hệ thống đặt phòng
- Tạo và quản lý booking
- Theo dõi trạng thái đặt phòng
- Hệ thống yêu cầu thuê phòng

### Quản lý hợp đồng
- Tạo hợp đồng thuê phòng
- Theo dõi thời hạn hợp đồng
- Quản lý điều khoản

### Hệ thống thanh toán
- Tạo và theo dõi hóa đơn
- Nhiều phương thức thanh toán
- Báo cáo doanh thu

### Tin nhắn và thông báo
- Chat giữa host và tenant
- Hệ thống thông báo real-time
- Quản lý trạng thái đọc/chưa đọc

### Báo cáo và thống kê
- Dashboard cho admin
- Thống kê doanh thu
- Báo cáo hoạt động

## 🛠 Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer

## 📦 Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd rental-room-backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cập nhật các biến môi trường trong file `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
```

5. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Đăng ký tài khoản
- `POST /login` - Đăng nhập
- `GET /me` - Lấy thông tin user hiện tại
- `PUT /profile` - Cập nhật profile
- `PUT /password` - Đổi mật khẩu

### User Routes (`/api/users`)
- `GET /` - Lấy danh sách users (Admin)
- `GET /:id` - Lấy thông tin user (Admin)
- `PUT /:id` - Cập nhật user (Admin)
- `DELETE /:id` - Xóa user (Admin)

### Room Routes (`/api/rooms`)
- `GET /` - Lấy danh sách phòng
- `POST /` - Tạo phòng mới (Host)
- `GET /:id` - Lấy thông tin phòng
- `PUT /:id` - Cập nhật phòng (Host)
- `DELETE /:id` - Xóa phòng (Host)
- `GET /my-rooms` - Lấy phòng của host

### Booking Routes (`/api/bookings`)
- `POST /` - Tạo booking (Tenant)
- `GET /` - Lấy danh sách bookings (Admin)
- `GET /my-bookings` - Lấy bookings của tenant
- `PUT /:id` - Cập nhật trạng thái booking (Host)

### Contract Routes (`/api/contracts`)
- `POST /` - Tạo hợp đồng (Host)
- `GET /` - Lấy danh sách hợp đồng (Admin)
- `GET /:id` - Lấy thông tin hợp đồng

### Payment Routes (`/api/payments`)
- `POST /` - Tạo hóa đơn (Host)
- `GET /` - Lấy danh sách hóa đơn
- `PUT /:id` - Cập nhật trạng thái thanh toán

### Message Routes (`/api/messages`)
- `POST /` - Gửi tin nhắn
- `GET /conversation/:tenantId/:hostId` - Lấy cuộc trò chuyện
- `GET /conversations` - Lấy danh sách cuộc trò chuyện

### Statistics Routes (`/api/statistics`)
- `GET /dashboard` - Thống kê tổng quan (Admin)
- `GET /host` - Thống kê của host
- `GET /tenant` - Thống kê của tenant

## 🔐 Phân quyền

### Guest
- Xem danh sách phòng
- Tìm kiếm phòng
- Đăng ký tài khoản

### Tenant
- Tất cả quyền của Guest
- Đặt phòng
- Gửi tin nhắn
- Xem hợp đồng và thanh toán
- Đánh giá phòng

### Host
- Tất cả quyền của Tenant
- Tạo và quản lý phòng
- Xử lý booking
- Tạo hợp đồng
- Quản lý thanh toán

### Admin
- Tất cả quyền hệ thống
- Quản lý users
- Duyệt phòng
- Xem báo cáo thống kê
- Quản lý reports

## 📊 Database Schema

Hệ thống sử dụng 17 collections chính:
1. **users** - Thông tin người dùng
2. **rooms** - Thông tin phòng trọ
3. **bookings** - Đặt phòng
4. **contracts** - Hợp đồng
5. **payments** - Thanh toán
6. **messages** - Tin nhắn
7. **room_requests** - Yêu cầu thuê
8. **room_approvals** - Duyệt phòng
9. **statistics** - Thống kê
10. **transactions** - Giao dịch
11. **search_logs** - Lịch sử tìm kiếm
12. **reviews** - Đánh giá
13. **export_logs** - Lịch sử xuất báo cáo
14. **reports** - Báo cáo vi phạm
15. **roles** - Phân quyền
16. **roomStats** - Thống kê phòng
17. **notifications** - Thông báo

## 🚀 Deployment

1. Build application:
```bash
npm run build
```

2. Set environment variables for production
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

## 🧪 Testing

```bash
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Tên của bạn - Initial work

## 🆘 Support

Nếu có bất kỳ vấn đề gì, vui lòng tạo issue trên GitHub repository.