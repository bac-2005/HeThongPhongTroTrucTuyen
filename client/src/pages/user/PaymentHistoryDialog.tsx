import { useState, useMemo, useEffect } from 'react';
import { X, Search, Filter, CreditCard, DollarSign, Calendar, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { buildHeaders } from '../../utils/config';

interface PaymentHistory {
    id: string;
    date: string;
    amount: number;
    method: 'credit_card' | 'bank_transfer' | 'e_wallet';
    status: 'paid' | 'failed' | 'pending';
    description: string;
    vnpTxnRef: string;
    fee: number;
}

interface Props {
    isOpen: boolean;
    closeDialog: () => void;
}

export default function PaymentHistoryDialog({ isOpen, closeDialog }: Props) {
    const [listItems, setListItems] = useState<any>([])

    const fetchData = async () => {
        try {
            // BE trả all (không phân trang)
            const res = await fetch(`http://localhost:3000/payments?limit=9999`, { headers: buildHeaders() });
            const data = await res.json();
            setListItems(data.data)
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Thành công';
            case 'failed': return 'Thất bại';
            case 'pending': return 'Đang xử lý';
            default: return status;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
        switch (status) {
            case 'paid': return `${baseClasses} bg-green-100 text-green-800`;
            case 'failed': return `${baseClasses} bg-red-100 text-red-800`;
            case 'pending': return `${baseClasses} bg-amber-100 text-amber-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };


    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={closeDialog}
                >
                    {/* Dialog */}
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-200 transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Lịch sử thanh toán
                                    </h3>
                                    <p className="text-blue-400">
                                        Tổng {listItems.length} giao dịch
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeDialog}
                                className="w-8 h-8 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-colors duration-200 text-black"
                            >
                                X
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto max-h-96">
                            {listItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <CreditCard className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giao dịch</h3>
                                    <p className="text-gray-500">Không tìm thấy giao dịch phù hợp với bộ lọc</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {listItems.map((payment: any) => (
                                        <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{payment.description}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Calendar size={12} />
                                                            {formatDate(payment.updatedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </div>
                                                    {payment.fee > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            Phí: {formatCurrency(payment.fee)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={getStatusBadge(payment.paymentStatus)}>
                                                        {getStatusIcon(payment.paymentStatus)}
                                                        {getStatusText(payment.paymentStatus)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        {payment.vnpTxnRef}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}