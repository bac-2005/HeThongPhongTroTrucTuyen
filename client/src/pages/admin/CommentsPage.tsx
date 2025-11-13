import React, { useState, useEffect } from 'react';
import { X, User, Calendar, MessageSquare, Trash2, Star, MapPin, Home, XCircle, Check, CheckCircle } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { reviewService } from '../../services/reviewService';
import type { Review, ReviewReplyFormData } from '../../types/review';
import { Eye } from "lucide-react";

interface CommentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string | null;
}

const CommentDetailModal: React.FC<CommentDetailModalProps> = ({
  isOpen,
  onClose,
  reviewId
}) => {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    if (isOpen && reviewId) {
      loadReview();
    }
  }, [isOpen, reviewId]);

  const loadReview = async () => {
    if (!reviewId) return;

    try {
      setLoading(true);
      const reviewData = await reviewService.getReviewById(reviewId);
      setReview(reviewData);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải chi tiết đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!reviewId || !confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;

    try {
      await reviewService.deleteReply(reviewId, replyId);
      success('Thành công', 'Đã xóa phản hồi');
      await loadReview();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa phản hồi');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết đánh giá</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : review ? (
            <div className="p-6 space-y-6">
              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {review.tenant.avatar ? (
                        <img
                          src={review.tenant.avatar}
                          alt={review.tenant.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{review.tenant.fullName}</h4>
                      <p className="text-sm text-gray-500">{review.tenant.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{formatDate(review.reviewDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="mb-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-start gap-4">
                    {review.room.images && review.room.images.length > 0 && (
                      <img
                        src={review.room.images[0]}
                        alt={review.room.roomTitle}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <h5 className="font-medium text-gray-900">{review.room.roomTitle}</h5>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{review.room.location}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Diện tích: <span className="font-medium">{review.room.area}m²</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Giá: <span className="font-medium text-green-600">{formatPrice(review.room.price)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Đánh giá:</p>
                  {renderStars(review.rating)}
                </div>

                {/* Review Content */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Nội dung đánh giá:</p>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-900 leading-relaxed">{review.review}</p>
                  </div>
                </div>

                {/* Host Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chủ trọ:</p>
                  <div className="flex items-center gap-2">
                    {review.room.host.avatar ? (
                      <img
                        src={review.room.host.avatar}
                        alt={review.room.host.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{review.room.host.fullName}</p>
                      <p className="text-sm text-gray-500">{review.room.host.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div>
                {/* Replies List */}
                <div className="space-y-4">
                  {review.replies && review.replies.length > 0 ? (
                    review.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-4 ml-8 border-l-4 border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.isAdmin ? 'bg-blue-100' : 'bg-gray-200'
                              }`}>
                              <User className={`w-4 h-4 ${reply.isAdmin ? 'text-blue-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{reply.author}</span>
                                {reply.isAdmin && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{reply.authorEmail}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                            title="Xóa phản hồi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 ml-11">
                          <p className="text-gray-900 leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>Chưa có phản hồi nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">Không tìm thấy đánh giá</p>
              <p className="text-sm">Đánh giá có thể đã bị xóa hoặc không tồn tại</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Comments Management Component
const CommentsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { success, error } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviews(),
        reviewService.getReviewStats()
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải dữ liệu đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.room.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const updateReviewStatus = async (id: string, isApproved: boolean) => {
    try {
      await reviewService.updateReviewStatus(id, isApproved);
      success('Thành công', `${isApproved ? 'Duyệt' : 'Hủy duyệt'} đánh giá thành công`);
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', `Không thể ${isApproved ? 'duyệt' : 'hủy duyệt'} đánh giá`);
    }
  };

  const handleViewDetail = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReviewId(null);
    loadData();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await reviewService.deleteReview(id);
      success('Thành công', 'Đã xóa đánh giá');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa đánh giá');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-600">Xem và quản lý đánh giá từ khách hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600 fill-current" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xem</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá, người dùng, phòng trọ hoặc địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách đánh giá ({filteredReviews.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng trọ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {review.tenant.avatar ? (
                          <img
                            src={review.tenant.avatar}
                            alt={review.tenant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{review.tenant.fullName}</div>
                        <div className="text-sm text-gray-500">{review.tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {review.room.images && review.room.images.length > 0 && (
                        <img
                          src={review.room.images[0]}
                          alt={review.room.roomTitle}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {review.room.roomTitle}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-xs">{review.room.location}</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {formatPrice(review.room.price.value)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <p className="line-clamp-3">{review.review}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(review.reviewDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {review.isApproved ? (
                        <button
                          onClick={() => updateReviewStatus(review.reviewId, false)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hủy Duyệt"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (<button
                        onClick={() => updateReviewStatus(review.reviewId, true)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Duyệt"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>)}
                      <button
                        onClick={() => handleViewDetail(review.reviewId)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => handleDeleteReview(review.reviewId)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Ẩn đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy đánh giá nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      <CommentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        reviewId={selectedReviewId}
      />
    </div>
  );
};

export default CommentsPage;