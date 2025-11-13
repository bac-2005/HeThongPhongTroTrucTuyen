import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, User, Home, DollarSign, FileText, Clock } from 'lucide-react';
import { buildHeaders } from '../../utils/config';
import axios from 'axios';

type Props = {
    onClose: () => void;
    contractId: string;
}

const ContractDialog = ({ onClose, contractId }: Props) => {
    const [contractData, setContractData] = useState({})
    // Dữ liệu hợp đồng

    if (!contractId) return;

    const fetchData = async () => {
        try {
            if (!contractId) return;
            // Hợp đồng của tenant
            const res = await axios.get(`http://localhost:3000/contracts/${contractId}`, {
                headers: buildHeaders(),
            });
            console.log(res);

            setContractData(res?.data?.data)
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
    }, [contractId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'terminated': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Đang hoạt động';
            case 'terminated': return 'Đã kết thúc';
            case 'pending': return 'Đang chờ';
            default: return status;
        }
    };

    return (
        <div>
            {/* Dialog overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                {/* Dialog content */}
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Chi Tiết Hợp Đồng</h2>
                            <p className="text-sm mt-1">Mã HĐ: {contractData.contractId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Thông tin hợp đồng */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Thông Tin Hợp Đồng
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mã đặt phòng:</span>
                                            <span className="font-medium">{contractData.bookingId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contractData.status)}`}>
                                                {getStatusText(contractData.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Thời hạn:</span>
                                            <span className="font-medium">{contractData.duration} tháng</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Điều khoản:</span>
                                            <span className="font-medium">{contractData.terms}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin thời gian */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Thời Gian Thuê
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày bắt đầu:</span>
                                            <span className="font-medium text-green-700">{formatDate(contractData.startDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày kết thúc:</span>
                                            <span className="font-medium text-red-700">{formatDate(contractData.endDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày tạo:</span>
                                            <span className="font-medium">{formatDate(contractData.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin chi phí */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        Thông Tin Chi Phí
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Giá thuê/tháng:</span>
                                            <span className="font-medium text-green-700">
                                                {formatCurrency(contractData.roomInfo?.price.value)}
                                            </span>
                                        </div>
                                        {/* <div className="flex justify-between border-t pt-3">
                                            <span className="text-gray-800 font-semibold">Tổng tiền ({contractData.duration} tháng):</span>
                                            <span className="font-bold text-lg text-green-700">
                                                {formatCurrency(contractData.rentPrice)}
                                            </span>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin phòng và người thuê */}
                            <div className="space-y-6">
                                {/* Thông tin phòng */}
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Home className="w-5 h-5 text-orange-600" />
                                        Thông Tin Phòng
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-600">Tên phòng:</span>
                                            <p className="font-medium text-lg">{contractData.roomInfo?.roomTitle}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Địa điểm:</span>
                                            <span className="font-medium flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-red-500" />
                                                {contractData.roomInfo?.location}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 block mb-2">Tiện ích:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {contractData.roomInfo?.utilities.map((utility, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {utility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin người thuê */}
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-600" />
                                        Thông Tin Người Thuê
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Họ tên:</span>
                                            <span className="font-medium">{contractData?.tenantInfo?.fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium text-blue-600">{contractData?.tenantInfo?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Số điện thoại:</span>
                                            <span className="font-medium">{contractData?.tenantInfo?.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mã người dùng:</span>
                                            <span className="font-medium text-gray-500">{contractData?.tenantInfo?.userId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin cập nhật */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-600" />
                                        Lịch Sử Cập Nhật
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cập nhật lần cuối:</span>
                                            <span className="font-medium">{formatDate(contractData.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDialog;