import { buildHeaders } from "../utils/config";

const API_BASE_URL = 'http://localhost:3000';

export interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'host' | 'tenant';
  status: 'active' | 'inactive';
}

export interface Message {
  id: string;
  messageId: string;
  tenantId?: string;
  hostId?: string;
  receiverId?: string;
  message: string;
  time: string;
  isRead: boolean;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface MessageStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

class MessageService {
  private async fetchUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      console.log('Users fetched:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  private async fetchMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const messages = await response.json();
      console.log('Messages fetched:', messages);
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const [messages, users] = await Promise.all([
        this.fetchMessages(),
        this.fetchUsers()
      ]);

      console.log('=== PROCESSING CONVERSATIONS ===');
      console.log('Total messages:', messages.length);
      console.log('Total users:', users.length);

      // Tạo map user theo userId
      const userByUserId = new Map<string, User>();
      const userById = new Map<string, User>();
      
      users.forEach(user => {
        userByUserId.set(user.userId, user);
        userById.set(user.id, user);
        console.log(`User mapped: ${user.userId} (${user.id}) -> ${user.fullName}`);
      });

      // Admin có userId = U001 và id = f7b3
      const adminUserIds = ['U001'];
      const adminIds = ['f7b3'];
      
      console.log('Admin UserIds:', adminUserIds);
      console.log('Admin IDs:', adminIds);
      
      // Nhóm tin nhắn theo người tham gia (không phải admin)
      const conversationMap = new Map<string, Message[]>();

      messages.forEach((message, index) => {
        console.log(`\n--- Processing message ${index + 1} ---`);
        console.log('Message:', message);

        let partnerUserId: string | undefined;
        let partnerId: string | undefined;

        // Logic tìm partner:
        // 1. Nếu tenantId là admin, thì partner là hostId
        // 2. Nếu hostId là admin (userId hoặc id), thì partner là tenantId  
        // 3. Nếu không có admin, tìm người không phải admin
        
        if (adminUserIds.includes(message.tenantId || '')) {
          // Admin gửi tin nhắn, partner là hostId
          partnerUserId = message.hostId;
          console.log(`Admin sent message, partner hostId: ${partnerUserId}`);
        } else if (adminUserIds.includes(message.hostId || '') || adminIds.includes(message.hostId || '')) {
          // Admin nhận tin nhắn, partner là tenantId
          partnerUserId = message.tenantId;
          console.log(`Admin received message, partner tenantId: ${partnerUserId}`);
        } else {
          // Không có admin, tìm người không phải admin
          if (message.tenantId && !adminUserIds.includes(message.tenantId)) {
            partnerUserId = message.tenantId;
            console.log(`Non-admin conversation, partner tenantId: ${partnerUserId}`);
          } else if (message.hostId && !adminUserIds.includes(message.hostId) && !adminIds.includes(message.hostId)) {
            partnerUserId = message.hostId;
            console.log(`Non-admin conversation, partner hostId: ${partnerUserId}`);
          }
        }

        // Tìm user object từ partnerUserId
        if (partnerUserId) {
          // Thử tìm theo userId trước
          let partner = userByUserId.get(partnerUserId);
          if (!partner) {
            // Nếu không tìm thấy theo userId, thử tìm theo id
            partner = userById.get(partnerUserId);
          }
          
          if (partner) {
            partnerId = partner.id;
            console.log(`Partner found: ${partnerUserId} -> ${partner.fullName} (${partnerId})`);

            if (!conversationMap.has(partnerId)) {
              conversationMap.set(partnerId, []);
              console.log(`Created new conversation for: ${partnerId}`);
            }

            conversationMap.get(partnerId)!.push({
              ...message,
              sender: message.tenantId ? (userByUserId.get(message.tenantId) || userById.get(message.tenantId)) : undefined,
              receiver: message.hostId ? (userByUserId.get(message.hostId) || userById.get(message.hostId)) : undefined
            });
          } else {
            console.log(`Partner user not found for: ${partnerUserId}`);
          }
        } else {
          console.log('No partner found for message:', message);
        }
      });

      console.log('\n=== CONVERSATION MAP ===');
      console.log('Number of conversations:', conversationMap.size);
      conversationMap.forEach((msgs, partnerId) => {
        console.log(`Conversation ${partnerId}: ${msgs.length} messages`);
      });

      const conversations: Conversation[] = [];

      conversationMap.forEach((messages, partnerId) => {
        const participant = userById.get(partnerId);
        console.log(`\n--- Creating conversation for ${partnerId} ---`);
        console.log('Participant:', participant);

        if (!participant) {
          console.log(`Participant not found for ID: ${partnerId}`);
          return;
        }

        // Sắp xếp tin nhắn theo thời gian
        messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        const lastMessage = messages[messages.length - 1];
        
        // Đếm tin nhắn chưa đọc (không phải từ admin)
        const unreadCount = messages.filter(m => {
          const isFromAdmin = adminUserIds.includes(m.tenantId || '') || adminIds.includes(m.hostId || '');
          return !m.isRead && !isFromAdmin;
        }).length;

        console.log(`Conversation stats:`, {
          partnerId,
          participantName: participant.fullName,
          messageCount: messages.length,
          unreadCount,
          lastMessage: lastMessage.message
        });

        conversations.push({
          id: partnerId,
          participant,
          lastMessage: lastMessage.message,
          lastMessageTime: lastMessage.time,
          unreadCount,
          messages
        });
      });

      // Sắp xếp theo thời gian tin nhắn cuối
      conversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log('\n=== FINAL RESULT ===');
      console.log('Final conversations:', conversations.length);
      conversations.forEach(conv => {
        console.log(`- ${conv.participant.fullName}: ${conv.messages.length} messages, ${conv.unreadCount} unread`);
      });

      return conversations;

    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }

  async getMessageStats(): Promise<MessageStats> {
    try {
      const messages = await this.fetchMessages();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const adminUserIds = ['U001'];
      const adminIds = ['f7b3'];

      const stats = {
        total: messages.length,
        unread: messages.filter(m => {
          const isFromAdmin = adminUserIds.includes(m.tenantId || '') || adminIds.includes(m.hostId || '');
          return !m.isRead && !isFromAdmin;
        }).length,
        today: messages.filter(m => new Date(m.time) >= today).length,
        thisWeek: messages.filter(m => new Date(m.time) >= thisWeek).length
      };

      console.log('Message stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      const newMessage = {
        messageId: `MSG${Date.now()}`,
        tenantId: 'U001', // Admin gửi  
        hostId: conversationId, // Người nhận (sử dụng id)
        message: content,
        time: new Date().toISOString(),
        isRead: false
      };

      console.log('Sending message:', newMessage);

      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const result = await response.json();
      console.log('Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      console.log('Marking message as read:', messageId);
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) throw new Error('Failed to mark message as read');
      console.log('Message marked as read successfully');
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      console.log('Marking conversation as read:', conversationId);
      const messages = await this.fetchMessages();
      const adminUserIds = ['U001'];
      const adminIds = ['f7b3'];
      
      // Tìm user theo ID để lấy userId
      const users = await this.fetchUsers();
      const userById = new Map(users.map(u => [u.id, u]));
      const targetUser = userById.get(conversationId);
      
      if (!targetUser) {
        console.log('Target user not found:', conversationId);
        return;
      }

      const targetUserId = targetUser.userId || targetUser.id;
      console.log('Target userId:', targetUserId);
      
      const conversationMessages = messages.filter(m => {
        const isInConversation = (m.tenantId === targetUserId || m.hostId === targetUserId || 
                                 m.tenantId === conversationId || m.hostId === conversationId);
        const isFromPartner = !adminUserIds.includes(m.tenantId || '') && !adminIds.includes(m.hostId || '');
        return isInConversation && !m.isRead && isFromPartner;
      });

      console.log('Messages to mark as read:', conversationMessages);

      const promises = conversationMessages.map(message =>
        fetch(`${API_BASE_URL}/messages/${message.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isRead: true }),
        })
      );

      await Promise.all(promises);
      console.log('Conversation marked as read successfully');
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      console.log('Deleting conversation:', conversationId);
      const messages = await this.fetchMessages();
      
      // Tìm user theo ID để lấy userId
      const users = await this.fetchUsers();
      const userById = new Map(users.map(u => [u.id, u]));
      const targetUser = userById.get(conversationId);
      
      if (!targetUser) {
        console.log('Target user not found:', conversationId);
        return;
      }

      const targetUserId = targetUser.userId || targetUser.id;
      console.log('Target userId:', targetUserId);
      
      const conversationMessages = messages.filter(m => 
        m.tenantId === targetUserId || m.hostId === targetUserId ||
        m.tenantId === conversationId || m.hostId === conversationId
      );

      console.log('Messages to delete:', conversationMessages);

      const promises = conversationMessages.map(message =>
        fetch(`${API_BASE_URL}/messages/${message.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      console.log('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();