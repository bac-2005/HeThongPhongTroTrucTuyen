import '../../css/PostCard.css';
import { convertStatus } from '../../utils/format';

type PostCardProps = {
  title: string;
  price: { value: number; unit: string };
  area: number;
  address: string;
  images: string[];
  description: string;
  status: string;
  roomType: string;
  utilities: string[];
  createdAt: string;
};

const PostCard = ({
  title = '',
  price = { value: 0, unit: 'VNĐ/tháng' },
  area = 0,
  address = '',
  images = [],
  description = '',
  status = '',
  roomType = '',
  utilities = [],
  createdAt = '',
}: PostCardProps) => {
  return (
    <div className="post-card">
      <div className="post-card-images">
        <div className="left-main-image">
          {images[0] && <img src={images[0]} alt="Ảnh chính" className="main-image" />}
        </div>
        <div className="right-sub-images">
          {images[1] && <img src={images[1]} alt="Ảnh phụ 1" className="sub-image" />}
          {images[2] && <img src={images[2]} alt="Ảnh phụ 2" className="sub-image" />}
        </div>
      </div>

      <div className="post-card-content">
        <div className="post-card-tag">CHO THUÊ NHANH</div>

        <h2 className="post-card-title">
          <span className="post-card-stars">★★★★★</span> {title}
        </h2>

        <div className="post-card-info">
          {price.value.toLocaleString()} {price.unit}
          <span> • {area} m² • {address}</span>
        </div>

        {description && (
          <p className="post-card-description">{description}</p>
        )}

        <div className="post-card-extra">
          <div><strong>Trạng thái:</strong> {convertStatus(status)}</div>
          <div><strong>Loại phòng:</strong> {convertStatus(roomType)}</div>
          <div><strong>Tiện ích:</strong> {utilities.join(', ') || 'Không có'}</div>
          <div><strong>Ngày đăng:</strong> {new Date(createdAt).toLocaleDateString('vi-VN')}</div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
