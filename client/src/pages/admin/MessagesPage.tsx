import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Search, 
  Eye,
  Trash2,
  Send,
  Calendar,
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { messageService } from '../../services/messageService';
import type { Message, MessageStats } from '../../types/message';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  const { success, error } = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, statsData] = await Promise.all([
        messageService.getMessages(),
        messageService.getMessageStats()
      ]);
      setMessages(messagesData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải dữ liệu tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.receiver.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = readFilter === 'all' || 
                       (readFilter === 'read' && message.isRead) ||
                       (readFilter === 'unread' && !message.isRead);
    
    return matchesSearch && matchesRead;
  });

  const handleViewDetail = (message: Message) => {
    setSelectedMessage(message);
    setResponseText('');
    setIsDetailModalOpen(true);
    
    // Mark as read if unread
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    try {
      // Create a response message
      const responseMessage = {
        hostId: selectedMessage.receiverId,
        tenantId: selectedMessage.senderId,
        senderId: selectedMessage.receiverId, // Admin responds as the receiver
        message: responseText,
        time: new Date().toISOString(),
        isRead: false
      };

      await messageService.sendMessage(responseMessage);
      success('Thành công', 'Đã gửi phản hồi');
      setResponseText('');
      setIsDetailModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể gửi phản hồi');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;

    try {
      await messageService.deleteMessage(id);
      success('Thành công', 'Đã xóa tin nhắn');
      await loadData();
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa tin nhắn');
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

  const getMessagePreview = (message: string) => {
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin nhắn</h1>
          <p className="text-gray-600">Quản lý tin nhắn giữa chủ trọ và người thuê</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng tin nhắn</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hôm nay</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tuần này</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm tin nhắn, người gửi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as 'all' | 'read' | 'unread')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả tin nhắn</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách tin nhắn ({filteredMessages.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người nhận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className={`hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {message.sender.avatar ? (
                          <img 
                            src={message.sender.avatar} 
                            alt={message.sender.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{message.sender.fullName}</div>
                        <div className="text-sm text-gray-500">{message.sender.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {message.receiver.avatar ? (
                          <img 
                            src={message.receiver.avatar} 
                            alt={message.receiver.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{message.receiver.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <p className="line-clamp-2">{getMessagePreview(message.message)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      message.isRead 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message.isRead ? 'Đã đọc' : 'Chưa đọc'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(message.time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(message)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Xóa tin nhắn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy tin nhắn nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {isDetailModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Chi tiết tin nhắn</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <User className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              <div className="space-y-6">
                {/* Message Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Người gửi</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {selectedMessage.sender.avatar ? (
                            <img 
                              src={selectedMessage.sender.avatar} 
                              alt={selectedMessage.sender.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedMessage.sender.fullName}</p>
                          <p className="text-sm text-gray-500">{selectedMessage.sender.email}</p>
                          {selectedMessage.sender.phone && (
                            <p className="text-sm text-gray-500">{selectedMessage.sender.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Người nhận</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {selectedMessage.receiver.avatar ? (
                            <img 
                              src={selectedMessage.receiver.avatar} 
                              alt={selectedMessage.receiver.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedMessage.receiver.fullName}</p>
                          <p className="text-sm text-gray-500">{selectedMessage.receiver.email}</p>
                          {selectedMessage.receiver.phone && (
                            <p className="text-sm text-gray-500">{selectedMessage.receiver.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Thời gian: {formatDate(selectedMessage.time)}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedMessage.isRead 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMessage.isRead ? 'Đã đọc' : 'Chưa đọc'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nội dung tin nhắn</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Response Form */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phản hồi tin nhắn</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập phản hồi của bạn..."
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Gửi phản hồi
                    </button>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;