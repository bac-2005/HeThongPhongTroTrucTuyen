export interface Review {
  id: string;
  reviewId: string;
  roomId: string;
  tenantId: string;
  review: string;
  rating: number;
  isApproved: boolean;
  reviewDate: string;
  status?: 'approved' | 'pending' | 'rejected';
  replies?: ReviewReply[];
  // Populated data
  tenant?: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  room?: {
    roomTitle: string;
    location: string;
    area: number;
    price: number;
    images: string[];
    hostId: string;
    host?: {
      fullName: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
  };
}

export interface ReviewReply {
  id: string;
  content: string;
  author: string;
  authorEmail: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface ReviewReplyFormData {
  content: string;
  author: string;
  authorEmail: string;
  isAdmin: boolean;
}

export interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  averageRating: number;
}

export interface ReviewFilters {
  status?: Review['status'] | 'all';
  rating?: number | 'all';
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}