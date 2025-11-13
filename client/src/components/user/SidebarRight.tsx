import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/SidebarRight.css';
import { useSearch } from '../../contexts/SearchContext';
import { buildHeaders } from '../../utils/config';

interface Room {
  id: string;
  title: string;
  price: string;
  images: string[];
  postedDate: string;
}

const SidebarRight = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  const { setSearchRoom, searchRoom } = useSearch();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // const params = new URLSearchParams(searchRoom as any).toString();
        const response = await fetch(`http://localhost:3000/rooms`, { headers: buildHeaders() });
        const data = await response.json();
        setRooms(data.slice().reverse().slice(0, 5)); // Lấy 5 bài mới nhất
      } catch (error) {
        console.error('Lỗi khi tải tin mới:', error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="sidebar-container">
      <div className="sidebar-section">
        <h4>Xem khoảng giá</h4>
        <div className="price-area">
          <div>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, maxPrice: 1000000 }))}><span>›</span> <a>Dưới 1 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 2000000, maxPrice: 3000000 }))}><span>›</span> <a>Từ 2 - 3 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 5000000, maxPrice: 7000000 }))}><span>›</span> <a>Từ 5 - 7 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 10000000, maxPrice: 15000000 }))}><span>›</span> <a>Từ 10 - 15 triệu</a></p>
          </div>
          <div>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 1000000, maxPrice: 2000000 }))}><span>›</span> <a>Từ 1 - 2 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 3000000, maxPrice: 5000000 }))}><span>›</span> <a>Từ 3 - 5 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 7000000, maxPrice: 10000000 }))}><span>›</span> <a>Từ 7 - 10 triệu</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minPrice: 15000000 }))}><span>›</span> <a>Trên 15 triệu</a></p>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h4>Xem diện tích</h4>
        <div className="area-area">
          <div>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, maxArea: 20, minArea: 0 }))}><span>›</span> <a href="#">Dưới 20 m²</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minArea: 30, maxArea: 50 }))}><span>›</span> <a href="#">Từ 30 - 50m²</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minArea: 70, maxArea: 90 }))}><span>›</span> <a href="#">Từ 70 - 90m²</a></p>
          </div>
          <div>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minArea: 20, maxArea: 30 }))}><span>›</span> <a href="#">Từ 20 - 30m²</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minArea: 50, maxArea: 70 }))}><span>›</span> <a href="#">Từ 50 - 70m²</a></p>
            <p onClick={() => setSearchRoom((pre: any) => ({ ...pre, minArea: 90, maxArea: 9999999 }))}><span>›</span> <a href="#">Trên 90m²</a></p>
          </div>
        </div>
      </div>
      {rooms.map((room) => (
        <Link
          key={room.id}
          to={`/posts/${room.id}`}
          className="post-item"
        >
          <img
            src={room.images?.[0]}
            alt={room.title}
          />
          <div className="post-info">
            <div>{room.title}</div>
            <div>{room.price}</div>
            <div>{room.postedDate}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SidebarRight;
