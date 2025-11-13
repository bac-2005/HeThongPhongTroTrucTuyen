// src/components/CommentCard.tsx
import { Calendar, Phone, MessageCircle, Star, User } from "lucide-react";

type BackendStatus = "pending" | "approved" | "rejected" | "cancelled";

interface CommentCardProps {
  request: {
    id: string;
    reviewId: string;           // ID của người đánh giá
    reviewerName: string;       // Tên người đánh giá
    review: string;             // Nội dung đánh giá
    rating?: number;            // Số sao (1-5)
    submittedAt: string;        // "dd/mm/yyyy - HH:MM"
    avatar?: string;            // Avatar người đánh giá
    roomTitle?: string;         // Phòng được đánh giá
    status?: BackendStatus;     // Trạng thái đánh giá
  };
}

const CommentCard = ({ request }: CommentCardProps) => {
  // Render rating stars
  const renderRating = (rating: number = 5) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  // Get status badge
  const getStatusBadge = (status?: BackendStatus) => {
    if (!status) return null;
    
    const statusConfig = {
      pending: { text: 'Đang xử lý', class: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      rejected: { text: 'Từ chối', class: 'bg-red-100 text-red-800' },
      cancelled: { text: 'Đã hủy', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {request.images[0] ? (
                <img 
                  src={request.images[0]} 
                  alt={request.reviewId}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {request.reviewId}
                </h3>
                {request.status && getStatusBadge(request.status)}
              </div>
              
              {/* Rating */}
              {request.rating && renderRating(request.rating)}
              
              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{request.reviewDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div className="px-5 pb-5">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {request.review}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;