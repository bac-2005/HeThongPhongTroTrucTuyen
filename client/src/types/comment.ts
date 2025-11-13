export interface CommentReply {
  id: string | number;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorEmail: string;
  roomId: string | number;
  roomTitle: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
  rating?: number;
  replies?: CommentReply[];
}

export interface CommentFormData {
  content: string;
  author: string;
  authorEmail: string;
  roomId: string | number;
  rating?: number;
}

export interface CommentReplyFormData {
  content: string;
  author: string;
  authorEmail: string;
  commentId: string | number;
}

export interface CommentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}
