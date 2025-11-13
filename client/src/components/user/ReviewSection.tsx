import { useEffect, useMemo, useState } from 'react';
import '../../css/ReviewSection.css';
import { buildHeaders } from '../../utils/config';

type ReviewApi = {
  isApproved: boolean;
  _id: string;
  reviewId: string;
  roomId: string;
  tenantId: string;
  review: string;
  rating: number;
  reviewDate: string;     // ISO
  isRecommended: boolean;
  images?: string[];
};

type ReviewUI = {
  id: string;
  user: string;           // hiển thị
  rating: number;
  comment: string;
  date: string;           // ISO
  isApproved: boolean;
  isRecommended: boolean;
  images: string[];
};

const mapApiToUI = (r: ReviewApi): ReviewUI => ({
  id: r.reviewId || r._id,
  user: r.tenantId || 'Ẩn danh',
  rating: r.rating,
  comment: r.review,
  date: r.reviewDate,
  isApproved: !!r.isApproved,
  isRecommended: !!r.isRecommended,
  images: r.images ?? [],
});

const ReviewSection = ({ roomId }: { roomId: string }) => {
  const [reviews, setReviews] = useState<ReviewUI[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reviews/${encodeURIComponent(roomId)}`, { headers: buildHeaders() });
        const json: { success: boolean; count?: number; data?: ReviewApi[] } = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : [];
        const mapped = arr.map(mapApiToUI);
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReviews(mapped);
      } catch (err) {
        console.error('Lỗi khi tải đánh giá:', err);
        setReviews([]);
      }
    };
    if (roomId) load();
  }, [roomId]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const s = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((s / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return alert('Vui lòng nhập nội dung đánh giá');

    
    const payload = {
      roomId,
      review: comment.trim(),
      rating,
      isRecommended: rating >= 4,
      images: [] as string[],
      reviewDate: new Date().toISOString(),
      // tenantId: 'currentTenantId' // nếu backend yêu cầu bắt buộc, lấy từ auth/token của bạn và truyền vào đây
    };

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/reviews`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Gửi đánh giá thất bại');

      const saved: { success: boolean; data?: ReviewApi } = await res.json();
      if (!saved?.data) throw new Error('Payload phản hồi không hợp lệ');

      const ui = mapApiToUI(saved.data);
   
      setReviews(prev => [ui, ...prev]);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error(error);
      alert('Có lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-section">
      <h3>Đánh giá trọ</h3>

    
      <div className="review-summary">
        <span><strong>{avgRating || '—'}</strong>/5</span>
        <span className="dot">•</span>
        <span>{reviews.length} đánh giá</span>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                cursor: 'pointer',
                fontSize: '20px',
                color: star <= rating ? '#FFD700' : '#ccc',
              }}
              aria-label={`Chọn ${star} sao`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Nội dung đánh giá"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>

      <div className="review-list">
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <p>
              <strong>{r.user}</strong>{' '}
              <span style={{ color: '#FFD700' }}>
                {'★'.repeat(r.rating)}{' '}
                <span style={{ color: '#ccc' }}>{'☆'.repeat(5 - r.rating)}</span>
              </span>
              {!r.isApproved && (
                <span className="badge-pending" title="Đánh giá đang chờ duyệt"> • Chờ duyệt</span>
              )}
              {r.isRecommended && <span className="badge-recommend"> • Đề xuất</span>}
            </p>

            <p>{r.comment}</p>

            {/* ảnh kèm theo (nếu có) */}
            {!!r.images.length && (
              <div className="review-images">
                {r.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`review-${r.id}-${idx}`} />
                ))}
              </div>
            )}

            <span className="review-date">
              {new Date(r.date).toLocaleDateString('vi-VN')}
            </span>
          </div>
        ))}

        {!reviews.length && <div className="muted">Chưa có đánh giá nào</div>}
      </div>
    </div>
  );
};

export default ReviewSection;
