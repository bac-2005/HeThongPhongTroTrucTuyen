import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PostCard from './PostCard';
import { useSearch } from '../../contexts/SearchContext';
import { buildHeaders } from '../../utils/config';

interface Room {
  _id: string;
  roomId: string;
  roomTitle: string;
  description: string;
  price: { value: number; unit: string };
  images: string[];
  location: string;
  area: number;
  status: string;
  roomType: string;
  utilities: string[];
  createdAt: string;
  updatedAt: string;
}


const PostList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  let keyword = searchParams.get("keyword");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  console.log(keyword);

  const { searchRoom } = useSearch();

  const searchByKeyword = async () => {
    fetch(`http://localhost:3000/rooms/search?keyword=${keyword || ""}`, { headers: buildHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data?.data || []);
        setLoading(false);
        window.history.replaceState({}, document.title, "/");
        keyword = ""
      })
      .catch((error) => {
        console.error('Lỗi khi tải danh sách phòng:', error);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (keyword?.length) {
      searchByKeyword()
      return
    }

    const params = new URLSearchParams(searchRoom as any).toString();
    fetch(`http://localhost:3000/rooms/searchRoom?limit=9999&${params}`, { headers: buildHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data?.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi tải danh sách phòng:', error);
        setLoading(false);
      });
  }, [searchRoom, keyword]);

  if (loading) return <div>Đang tải danh sách phòng...</div>;

  return (
    <div className="grid">
      {rooms.map((room) => (
        <Link
          to={`/posts/${room.roomId}`}
          key={room.roomId}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <PostCard
            title={room.roomTitle}
            price={room.price}
            area={room.area}
            address={room.location}
            images={room.images}
            description={room.description}
            status={room.status}
            roomType={room.roomType}
            utilities={room.utilities}
            createdAt={room.createdAt}
          />

        </Link>
      ))}
    </div>
  );
};

export default PostList;
