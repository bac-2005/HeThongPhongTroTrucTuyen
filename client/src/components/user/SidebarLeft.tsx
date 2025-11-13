import '../../css/SidebarLeft.css';
import db from '../../../db.json';
import { useSearch } from '../../contexts/SearchContext';



const SidebarLeft = () => {
  const roomCount = db.rooms.length;
  const { setSearchRoom } = useSearch();
  return (
    <div className="sidebar-left-container">
      <h2 className="sidebar-left-title">
        Kênh thông tin Phòng Trọ Thông Minh
      </h2>

      <p className="sidebar-left-bold-text">CÁC QUẬN HÀ NỘI</p>

      <div className="sidebar-left-buttons">
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Bắc Từ Liêm' }))} className="sidebar-left-button">Phòng trọ Bắc Từ Liêm</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Nam Từ Liêm' }))} className="sidebar-left-button">Phòng trọ Nam Từ Liêm</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Cầu Giấy' }))} className="sidebar-left-button">Phòng trọ Cầu Giấy</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Tây Hồ' }))} className="sidebar-left-button">Phòng trọ Tây Hồ</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Láng' }))} className="sidebar-left-button">Phòng trọ Láng</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Hà Đông' }))} className="sidebar-left-button">Phòng trọ Hà Đông</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Ba Đình' }))} className="sidebar-left-button">Phòng trọ Ba Đình</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Hai Bà Trưng' }))} className="sidebar-left-button">Phòng trọ Hai Bà Trưng</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Thanh Xuân' }))} className="sidebar-left-button">Phòng trọ Thanh Xuân</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Hoàng Mai' }))} className="sidebar-left-button">Phòng trọ Hoàng Mai</button>
        <button onClick={() => setSearchRoom((pre: any) => ({ ...pre, location: 'Long Biên' }))} className="sidebar-left-button">Phòng trọ Long Biên</button>
        <button onClick={() => setSearchRoom((pre: any) => ({  }))} className="sidebar-left-button all">
          Tất cả <span>›</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarLeft;
