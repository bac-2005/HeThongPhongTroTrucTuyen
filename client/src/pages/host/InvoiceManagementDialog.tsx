import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

interface InvoiceItem {
  id?: string;
  type: string;
  unitPrice: any;
  quantity: number;
  note: string;
}

interface Invoice {
  id: string;
  invoiceId: string;
  contractId: string;
  roomId: string;
  userId: string;
  billingMonth: string;
  items: InvoiceItem[];
  status: 'pending' | 'paid' | 'unpaid';
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  roomId: string;
  userId: string;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

const InvoiceManagementDialog: React.FC<InvoiceManagementDialogProps> = ({
  isOpen,
  onClose,
  contractId,
  roomId,
  userId,
  onInvoiceCreated
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const [formData, setFormData] = useState({
    billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
    status: 'pending' as const,
    note: '',
    items: [] as InvoiceItem[]
  });

  const paymentTypes = [
    { value: 'room', label: 'Tiền thuê', unitLabel: 'phòng' },
    { value: 'electricity', label: 'Tiền điện', unitLabel: 'kWh' },
    { value: 'water', label: 'Tiền nước', unitLabel: 'm³' },
    { value: 'service', label: 'Phí dịch vụ', unitLabel: 'dịch vụ' },
    { value: 'parking', label: 'Phí gửi xe', unitLabel: 'xe' },
    { value: 'cleaning', label: 'Phí vệ sinh', unitLabel: 'lần' },
    { value: 'internet', label: 'Phí internet', unitLabel: 'tháng' },
    { value: 'other', label: 'Khác', unitLabel: 'đơn vị' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
    { value: 'unpaid', label: 'Quá hạn', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen, contractId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/contract/${contractId}`);
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      billingMonth: new Date().toISOString().slice(0, 7),
      status: 'pending',
      note: '',
      items: []
    });
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        type: 'room',
        unitPrice: "",
        quantity: 1,
        note: ''
      }]
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const handleSaveInvoice = async () => {
    if (!formData.billingMonth || formData.items.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc và thêm ít nhất một khoản phí');
      return;
    }

    // Validate items
    const invalidItems = formData.items.some(item =>
      !item.type || item.unitPrice <= 0 || item.quantity <= 0
    );

    if (invalidItems) {
      alert('Vui lòng điền đầy đủ thông tin cho tất cả các khoản phí');
      return;
    }

    setLoading(true);

    try {
      const url = editingInvoice
        ? `${API_BASE_URL}/invoices/${editingInvoice.id}`
        : `${API_BASE_URL}/invoices`;

      const method = editingInvoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          roomId,
          userId,
          ...formData
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (editingInvoice) {
          setInvoices(prev => prev.map(inv =>
            inv.id === editingInvoice.id ? data.data : inv
          ));
        } else {
          setInvoices(prev => [data.data, ...prev]);
          onInvoiceCreated && onInvoiceCreated(data.data);
        }

        setShowCreateForm(false);
        setEditingInvoice(null);
        resetForm();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Có lỗi xảy ra khi lưu hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Có lỗi xảy ra khi xóa hóa đơn');
    } finally {
      setLoading(false);
      fetchInvoices();
    }
  };

  const startEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      billingMonth: invoice.billingMonth,
      status: invoice.status,
      note: invoice.note || '',
      items: [...invoice.items]
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingInvoice(null);
    setShowCreateForm(false);
    resetForm();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getPaymentTypeLabel = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.label || type;
  };

  const getPaymentTypeUnit = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.unitLabel || 'đơn vị';
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billingMonth.includes(searchTerm) ||
      invoice.items.some(item =>
        getPaymentTypeLabel(item.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || invoice.billingMonth === filterMonth;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Get unique months for filter
  const availableMonths = [...new Set(invoices.map(inv => inv.billingMonth))].sort().reverse();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Quản lý hóa đơn - Hợp đồng #{contractId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hóa đơn..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="all">Tất cả tháng</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingInvoice(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo hóa đơn
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Invoice List */}
            <div className={`${showCreateForm ? 'flex-1' : 'w-full'} overflow-y-auto`}>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có hóa đơn nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice) => {
                      const statusInfo = getStatusInfo(invoice.status);
                      const total = calculateTotal(invoice.items);

                      return (
                        <div
                          key={invoice.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-800">
                                  Hóa đơn tháng {invoice.billingMonth}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>

                              <div className="text-2xl font-bold text-blue-600 mb-3">
                                {formatCurrency(total)}
                              </div>
                            </div>

                            {invoice?.status !== "paid" && <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>}
                          </div>

                          {/* Items List */}
                          <div className="space-y-2 mb-3">
                            {invoice.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                  <span className="font-medium">{getPaymentTypeLabel(item.type)}</span>
                                  {item.note && <span className="text-gray-600 ml-2">({item.note})</span>}
                                </div>
                                <div className="text-right">
                                  <div>{formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.unitPrice * item.quantity)}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {invoice.note && (
                            <p className="text-sm text-gray-600 mb-2">{invoice.note}</p>
                          )}

                          <div className="text-xs text-gray-500">
                            ID: {invoice.id} • Tạo: {new Date(invoice.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Form Panel */}
            {showCreateForm && (
              <div className="w-1/2 border-l border-gray-200 bg-gray-50 overflow-y-auto max-h-[600px]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-800">
                      {editingInvoice ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn mới'}
                    </h3>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tháng thanh toán *
                        </label>
                        <input
                          type="month"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.billingMonth}
                          onChange={(e) => setFormData(prev => ({ ...prev, billingMonth: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú chung
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.note}
                          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                          placeholder="Nhập ghi chú..."
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-700">Các khoản phí *</h4>
                        <button
                          onClick={addNewItem}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm khoản phí
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.items.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="font-medium text-gray-700">Khoản phí #{index + 1}</h5>
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Loại phí
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.type}
                                  onChange={(e) => updateItem(index, 'type', e.target.value)}
                                >
                                  {paymentTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Đơn giá
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Số lượng ({getPaymentTypeUnit(item.type)})
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Ghi chú
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.note}
                                  onChange={(e) => updateItem(index, 'note', e.target.value)}
                                  placeholder="Nhập ghi chú..."
                                />
                              </div>

                              <div className="text-right">
                                <span className="text-lg font-semibold text-blue-600">
                                  Thành tiền: {formatCurrency(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {formData.items.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>Chưa có khoản phí nào</p>
                            <button
                              onClick={addNewItem}
                              className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                              Thêm khoản phí đầu tiên
                            </button>
                          </div>
                        )}
                      </div>

                      {formData.items.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-800">
                            Tổng cộng: {formatCurrency(calculateTotal(formData.items))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button
                        type="button"
                        onClick={handleSaveInvoice}
                        disabled={loading || formData.items.length === 0}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Đang xử lý...' : (editingInvoice ? 'Cập nhật' : 'Tạo hóa đơn')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!showCreateForm && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Tổng: {filteredInvoices.length} hóa đơn</span>
              <span>
                Tổng tiền: {formatCurrency(
                  filteredInvoices.reduce((sum, inv) => sum + calculateTotal(inv.items), 0)
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagementDialog;