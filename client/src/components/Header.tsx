// src/components/Header.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png"

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = (event: any) => {
    event.preventDefault();
    logout();
  };

  const navItems = [
    { path: "/host/dashboard", label: "Thống kê" },
    { path: "/host/profile", label: "Thông tin cá nhân" },
    { path: "/host/room-list", label: "Danh sách phòng của tôi" },
    // { path: "/host/room-status", label: "Trạng thái phòng" },
    { path: "/host/rental-request", label: "Yêu cầu thuê" },
    { path: "/host/create-contract", label: "Tạo hợp đồng" },
    { path: "/host/contracts", label: "Hợp đồng" },
    { path: "/host/logout", label: "Đăng xuất", onClick: handleLogout },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <Link to="/" className="text-2xl font-bold text-blue-600">
              Phòng trọ 123
            </Link> */}
            <img
              src={logo || "src/assets/logo.png"}
              alt="Logo"
              className="logo"
              onClick={() => {
                navigate('/');
              }}
            />
          </div>

          {/* User Info & Actions */}
          {/* <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Đăng tin mới
            </button>

            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700">Nguyễn Thị Mai</span>
            </div>
          </div> */}
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-1 mt-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={item?.onClick}
              className={`px-3 py-2 rounded-lg hover:bg-gray-100 transition ${location.pathname === item.path
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;