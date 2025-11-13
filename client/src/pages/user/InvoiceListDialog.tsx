import React, { useEffect, useState } from 'react';
import { X, Calendar, DollarSign, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';
import { buildHeaders } from '../../utils/config';
import { formatCurrency } from '../../utils/format';
import { paymentTypes, statusOptions } from '../../utils/code';

// Props cho component InvoiceListDialog
interface InvoiceListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPayment: (value: any) => void;
}



// Component chính InvoiceListDialog
export const InvoiceListDialog: React.FC<InvoiceListDialogProps> = ({
    isOpen,
    onClose,
    onPayment,
}) => {
    if (!isOpen) return null;

    const [invoices, setInvoices] = useState<any>([])

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                console.warn("User not found in localStorage");
                return;
            }

            const user = JSON.parse(userStr);
            const response: any = await fetch(
                `${API_BASE_URL}/invoices/user/${user.userId}`,
                {
                    method: "GET",
                    headers: buildHeaders(),
                }
            );

            const data = await response.json();

            setInvoices(data.data.map((x: any) => ({
                ...x,
                amount: x.items.reduce((sum: number, item: any) => (sum + (item.amount * item.quantity)), 0)
            })));
        } catch (err) {
            console.error(err);
        } finally {
        }
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

    const calculateTotal = (items: any) => {
        return items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Danh sách hóa đơn</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>


                {/* Invoice List */}
                {/* <div className="p-6 max-h-96 overflow-y-auto">
                    {invoices.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Không có hóa đơn nào</p>
                        </div>
                    ) : (
                        <div>
                            {invoices.map((invoice: any) => (
                                <InvoiceItem
                                    key={invoice.id}
                                    invoice={invoice}
                                    onPayment={onPayment}
                                />
                            ))}
                        </div>
                    )}
                </div> */}

                {/* Content */}
                <div className="flex-1">
                    <div className="flex h-full">
                        {/* Invoice List */}
                        <div className={`w-full max-h-[500px] overflow-y-auto`}>
                            <div className="p-6">
                                {invoices.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Chưa có hóa đơn nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {invoices.map((invoice: any) => {
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
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="space-y-2 mb-3">
                                                        {invoice.items.map((item: any, index: number) => (
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
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => onPayment(invoice)}
                                                            className="w-full mt-5 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                        >
                                                            Thanh toán {formatCurrency(invoice.totalAmount)}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
