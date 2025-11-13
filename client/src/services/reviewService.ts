import type { Review, ReviewStats, ReviewFilters } from '../types/review';
import { buildHeaders } from '../utils/config';

class ReviewService {
  private baseUrl = 'http://localhost:3000';

  async getReviews(filters?: ReviewFilters): Promise<Review[]> {
    try {
      // Fetch reviews, rooms, and users
      const [reviewsRes, roomsRes, usersRes] = await Promise.all([
        fetch(`${this.baseUrl}/reviews?limit=9999`, { headers: buildHeaders() }),
        fetch(`${this.baseUrl}/rooms?limit=9999`, { headers: buildHeaders() }),
        fetch(`${this.baseUrl}/users?limit=9999`, { headers: buildHeaders() })
      ]);

      const [reviewsData, roomsData, usersData] = await Promise.all([
        reviewsRes.json(),
        roomsRes.json(),
        usersRes.json()
      ]);

      // Combine data
      const enrichedReviews = reviewsData.data.map((review: any) => {
        // Find tenant by userId (matching tenantId)
        const tenant = usersData.data.users.find((u: any) => u.userId === review.tenantId);

        // Find room by roomId
        const room = roomsData.data.rooms.find((r: any) => r.roomId === review.roomId);

        // Find host through room's hostId
        const host = room ? usersData.data.users.find((u: any) => u.userId === room.hostId) : null;

        return {
          ...review,
          status: review.status || 'pending', // Default status if not set
          tenant: tenant || {
            fullName: 'Người dùng không tồn tại',
            email: 'unknown@example.com'
          },
          room: room ? {
            ...room,
            host: host || {
              fullName: 'Chủ trọ không tồn tại',
              email: 'unknown@example.com'
            }
          } : {
            roomTitle: 'Phòng không tồn tại',
            location: 'Không xác định',
            area: 0,
            price: 0,
            images: [],
            hostId: '',
            host: {
              fullName: 'Chủ trọ không tồn tại',
              email: 'unknown@example.com'
            }
          }
        };
      });

      // Apply filters
      let filteredReviews = enrichedReviews;

      if (filters) {
        if (filters.status && filters.status !== 'all') {
          filteredReviews = filteredReviews.filter((review: Review) =>
            review.status === filters.status
          );
        }
        if (filters.rating && filters.rating !== 'all') {
          filteredReviews = filteredReviews.filter((review: Review) =>
            review.rating === filters.rating
          );
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredReviews = filteredReviews.filter((review: Review) =>
            review.review.toLowerCase().includes(searchLower) ||
            review.tenant?.fullName.toLowerCase().includes(searchLower) ||
            review.room?.roomTitle.toLowerCase().includes(searchLower) ||
            review.room?.location.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredReviews.sort((a: Review, b: Review) =>
        new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
      );
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Không thể tải danh sách đánh giá');
    }
  }

  async getReviewById(id: string): Promise<Review> {
    try {
      const reviews = await this.getReviews();
      const review = reviews.find(r => r.reviewId === id);

      if (!review) {
        throw new Error('Review not found');
      }

      return review;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw new Error('Không thể tải thông tin đánh giá');
    }
  }

  async updateReviewStatus(id: string, isApproved: Review['isApproved']): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${id}/approve`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      throw new Error('Không thể cập nhật trạng thái đánh giá');
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Không thể xóa đánh giá');
    }
  }

  async getReviewStats(): Promise<ReviewStats> {
    try {
      const reviews = await this.getReviews();

      const stats: ReviewStats = {
        total: reviews.length,
        approved: reviews.filter(r => r.status === 'approved').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        averageRating: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw new Error('Không thể tải thống kê đánh giá');
    }
  }

  async addReply(reviewId: string, replyData: any): Promise<void> {
    // This would be implemented when you add reply functionality
    // For now, just a placeholder
    console.log('Add reply functionality not implemented yet');
  }

  async deleteReply(reviewId: string, replyId: string): Promise<void> {
    // This would be implemented when you add reply functionality
    // For now, just a placeholder
    console.log('Delete reply functionality not implemented yet');
  }
}

export const reviewService = new ReviewService();