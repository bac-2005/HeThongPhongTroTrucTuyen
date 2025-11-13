import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  Search,  
  Eye,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  Download,
  Star,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  X
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { messageService } from '../../services/messageService';
import type { Conversation, MessageStats } from '../../services/messageService';

const ContactsPage: React.FC = () => {
  // All useState hooks first
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'faqs' | 'info'>('messages');

  // useContext hook
  const { success, error } = useToastContext();

  // useMemo hooks
  const faqs = useMemo(() => [
    {
      id: 1,
      question: 'Làm thế nào để đăng ký tài khoản?',
      answer: 'Bạn có thể đăng ký tài khoản bằng cách click vào nút "Đăng ký" ở góc phải màn hình, sau đó điền đầy đủ thông tin cá nhân và xác thực email.',
      category: 'Tài khoản',
      views: 1250,
      helpful: 980
    },
    {
      id: 2,
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Tại trang đăng nhập, click vào "Quên mật khẩu", nhập email đã đăng ký và làm theo hướng dẫn trong email được gửi đến.',
      category: 'Tài khoản',
      views: 890,
      helpful: 750
    },
    {
      id: 3,
      question: 'Làm thế nào để đăng tin cho thuê phòng?',
      answer: 'Sau khi đăng nhập với tài khoản Host, vào mục "Quản lý phòng", click "Thêm phòng mới", điền đầy đủ thông tin phòng trọ, upload hình ảnh và submit để admin duyệt.',
      category: 'Đăng tin',
      views: 2100,
      helpful: 1800
    },
    {
      id: 4,
      question: 'Phí dịch vụ là bao nhiều?',
      answer: 'Hiện tại dịch vụ hoàn toàn miễn phí cho người tìm phòng. Chủ trọ chỉ trả phí hoa hồng khi có giao dịch thành công.',
      category: 'Thanh toán',
      views: 1560,
      helpful: 1200
    },
    {
      id: 5,
      question: 'Làm thế nào để liên hệ với chủ trọ?',
      answer: 'Tại trang chi tiết phòng, bạn có thể click nút "Liên hệ" để gửi tin nhắn trực tiếp cho chủ trọ hoặc sử dụng số điện thoại được hiển thị.',
      category: 'Liên hệ',
      views: 1890,
      helpful: 1650
    }
  ], []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const matchesSearch = conversation.participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conversation.participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [conversations, searchTerm]);

  // useCallback hooks
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading data...');
      const [conversationsData, statsData] = await Promise.all([
        messageService.getConversations(),
        messageService.getMessageStats()
      ]);
      console.log('Data loaded successfully:', { conversationsData, statsData });
      setConversations(conversationsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể tải dữ liệu tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [error]);

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read if it has unread messages
    if (conversation.unreadCount > 0) {
      try {
        await messageService.markConversationAsRead(conversation.id);
        // Update local state
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - conversation.unreadCount)
        }));
      } catch (err) {
        console.error('Error marking conversation as read:', err);
      }
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await messageService.sendMessage(selectedConversation.id, newMessage.trim());
      setNewMessage('');
      success('Thành công', 'Đã gửi tin nhắn');
      await loadData();
      
      // Refresh selected conversation
      const updatedConversations = await messageService.getConversations();
      const updatedConversation = updatedConversations.find(c => c.id === selectedConversation.id);
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể gửi tin nhắn');
    }
  }, [selectedConversation, newMessage, success, error, loadData]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) return;

    try {
      await messageService.deleteConversation(conversationId);
      success('Thành công', 'Đã xóa cuộc trò chuyện');
      await loadData();
      
      // Clear selected conversation if it was deleted
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể xóa cuộc trò chuyện');
    }
  }, [selectedConversation, success, error, loadData]);

  const formatMessageTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }, []);

  const formatLastMessageTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} phút`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} ngày`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // useEffect hooks
  useEffect(() => {
    loadData();
  }, []);

  // Debug effect
  useEffect(() => {
    console.log('Conversations updated:', conversations);
    console.log('Stats updated:', stats);
  }, [conversations, stats]);

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
          <h1 className="text-2xl font-bold text-gray-900">Liên hệ & Hỗ trợ</h1>
          <p className="text-gray-600">Quản lý tin nhắn liên hệ và hỗ trợ khách hàng</p>
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
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hôm nay</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tuần này</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Tin nhắn liên hệ
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faqs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Thông tin liên hệ
            </button>
          </nav>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="h-[600px] flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Không có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {conversation.participant.avatar ? (
                                <img 
                                  src={conversation.participant.avatar} 
                                  alt={conversation.participant.fullName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.participant.fullName}
                              </h4>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatLastMessageTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {selectedConversation.participant.avatar ? (
                          <img 
                            src={selectedConversation.participant.avatar} 
                            alt={selectedConversation.participant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversation.participant.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.participant.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selectedConversation.messages.map((message) => {
                      const isFromAdmin = message.tenantId === 'U001' || message.hostId === 'f7b3';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isFromAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isFromAdmin
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              isFromAdmin ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(message.time)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Chọn một cuộc trò chuyện</p>
                    <p className="text-gray-400 text-sm">Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Câu hỏi thường gặp</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Thêm FAQ mới
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{faq.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{faq.helpful}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'info' && (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Hotline</p>
                      <p className="text-gray-600">1900 1234 (24/7)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@rentalhub.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Địa chỉ</p>
                      <p className="text-gray-600">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <p className="text-gray-600">www.rentalhub.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Giờ làm việc</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thứ 2 - Thứ 6</span>
                    <span className="font-medium text-gray-900">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thứ 7</span>
                    <span className="font-medium text-gray-900">8:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ nhật</span>
                    <span className="font-medium text-gray-900">Nghỉ</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hotline 24/7</span>
                      <span className="font-medium text-green-600">Luôn sẵn sàng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Mạng xã hội</h3>
              <div className="flex items-center gap-4">
                <a href="#" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
                <a href="#" className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a href="#" className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thao tác nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                  <span>Tải báo cáo</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>Hướng dẫn sử dụng</span>
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span>Chat trực tiếp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;