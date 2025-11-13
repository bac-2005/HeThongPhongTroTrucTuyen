// Chi tiết phòng
// ../client/src/pages/host/RoomDetail.tsx
import { X, MapPin, Users, Zap, DollarSign, ArrowLeft, ArrowRight } from "lucide-react";
import { buildHeaders } from "../../utils/config";
import { useEffect, useState } from "react";
import CommentCard from "./CommentCard";
import SingleTenantCard from "./UserInfo";

interface Props {
  room: any;
  onClose: () => void;
}

export default function RoomDetail({ room, onClose }: Props) {
  const [listItems, setListItems] = useState<any>([])
  const [user, setUser] = useState<any>(null)

  const fetchData = async () => {
    try {
      // BE trả all (không phân trang)
      const res = await fetch(
        `http://localhost:3000/reviews/${room?.roomId}?limit=9999`,
        { headers: buildHeaders() }
      );
      const resUser = await fetch(
        `http://localhost:3000/contracts/user/${room?.roomId}?limit=9999`,
        { headers: buildHeaders() }
      );

      const data = await res.json();       // parse cho reviews
      const dataUser = await resUser.json(); // parse cho contracts

      setListItems(data?.data.length ? data?.data : []);
      console.log("Reviewưs:", data);

      setUser(dataUser?.data);
      console.log("Contracts:", dataUser);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
    }
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fallback image
  const defaultImage = "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1";
  const images = room.image && room.image.length > 0 ? room.image : [defaultImage];

  // Functions để điều hướng ảnh
  const goToPrevious = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết phòng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              {/* Ảnh chính với nút điều hướng */}
              <div className="relative">
                <img
                  src={images[selectedImageIndex]}
                  alt="Phòng"
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-sm"
                />

                {/* Nút sang trái và sang phải - chỉ hiển thị khi có nhiều hơn 1 ảnh */}
                {images.length > 1 && (
                  <>
                    <ArrowLeft
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    />

                    <ArrowRight
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    />

                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails - chỉ hiển thị khi có nhiều hơn 1 ảnh */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 ${selectedImageIndex === index
                        ? 'ring-2 ring-blue-500'
                        : 'opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`Ảnh ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.code}</h3>
                <p className="text-gray-600">{room.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Giá thuê</p>
                    <p className="font-semibold text-green-600">
                      {room.price?.toLocaleString()}đ/tháng
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Diện tích</p>
                    <p className="font-semibold">{room.area} m²</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Số người</p>
                    <p className="font-semibold">Tối đa {room.maxPeople} người</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">Điện</p>
                    <p className="font-semibold">{room.electricity}đ/kWh</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                <p className="font-medium">{room.location}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Tiền cọc</p>
                <p className="font-medium text-orange-600">{room.deposit}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tiện nghi</h4>
                <div className="grid grid-cols-2 gap-2">
                  {room.utilities?.split(",").map((utility: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{utility.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {room.tenant && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Người thuê hiện tại</h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={room.tenant.avatar}
                      alt={room.tenant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{room.tenant.name}</p>
                      <p className="text-sm text-gray-500">{room.tenant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {user && <>
            <h4 className="font-semibold text-gray-900 truncate my-3">Thông tin người thuê</h4>
            <SingleTenantCard user={user} />
          </>}
          <h4 className="font-semibold text-gray-900 truncate my-3">Danh sách đánh giá</h4>
          {!listItems.length && (
            <><p className="text-sm text-center text-gray-500 mb-2">Không có đánh giá nào</p></>
          )}
          {listItems.map((request: any) => (
            <CommentCard
              key={request.id}
              request={request}
            />
          ))}
        </div>
      </div>
    </div>
  );
}