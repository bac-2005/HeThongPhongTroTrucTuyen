import { useState } from 'react';
import { X, AlertTriangle, FileX, XCircle } from 'lucide-react';
import { buildHeaders } from '../../utils/config';

interface Props {
    contractId: string;
    isOpen?: boolean;
    showIcon?: boolean;
    onClose?: () => void;
    fetchData?: () => void;
}

export default function CancelContractDialog({ contractId, fetchData, showIcon,  onClose, isOpen  }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCancle = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:3000/contracts/${contractId}/cancel`, {
                method: 'PUT',
                headers: buildHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi hủy hợp đồng');
            }
            onClose && onClose()
            fetchData && fetchData();
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={onClose}
                >
                    {/* Dialog */}
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200 transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Xác nhận hủy hợp đồng
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Hành động này không thể hoàn tác
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-amber-800 mb-1">
                                            Lưu ý quan trọng
                                        </h4>
                                        <p className="text-sm text-amber-700">
                                            Việc hủy hợp đồng sẽ:
                                        </p>
                                        <ul className="text-sm text-amber-700 mt-2 space-y-1 ml-4">
                                            <li>• Chấm dứt toàn bộ nghĩa vụ trong hợp đồng</li>
                                            <li>• Có thể phát sinh phí hủy theo điều khoản</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                            >
                                Không, quay lại
                            </button>
                            <button
                                onClick={handleCancle}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận hủy'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}