export interface Message {
  id: string;
  messageId: string;
  hostId: string;
  tenantId: string;
  senderId: string;
  receiverId: string;
  message: string;
  time: string;
  isRead: boolean;
  // Populated data
  sender?: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  receiver?: {
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface MessageStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export interface MessageFilters {
  isRead?: boolean | 'all';
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateMessageData {
  hostId: string;
  tenantId: string;
  senderId: string;
  receiverId?: string;
  message: string;
  time?: string;
  isRead?: boolean;
}