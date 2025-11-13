import React, { useState, useEffect } from 'react';
import { X, User, Calendar, AlertTriangle, Trash2, Eye, MapPin, Home, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';

type ReportStatus = 'pending' | 'reviewed' | 'resolved' ;

type Report = {
    id: string;
    reportId: string;
    reason: string;
    roomId: string;
    title: string;
    description: string;
    status: ReportStatus;
    reportDate: string;
    createdAt: string;
    updatedAt: string;
    reporter: {
        id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    room: {
        roomId: string;
        roomTitle: string;
        location: string;
        price: number;
        images?: string[];
        host: {
            id: string;
            fullName: string;
            email: string;
            avatar?: string;
        };
    };
};

// Main Reports Management Component
const UserReport: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { success, error } = useToastContext();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/reports?limit=9999', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu báo cáo');

            const data = await response.json();
            console.log(data);

            const reportsList = data.data || data || [];
            setReports(reportsList);

            // Calculate stats
            const newStats = {
                total: reportsList.length,
                pending: reportsList.filter((r: Report) => r.status === 'pending').length,
                reviewed: reportsList.filter((r: Report) => r.status === 'reviewed').length,
                resolved: reportsList.filter((r: Report) => r.status === 'resolved').length
            };
            setStats(newStats);
        } catch (err) {
            console.error(err);
            error('Lỗi', 'Không thể tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };
    console.log(reports);

    const filteredReports = reports.filter(report => {
        return report
        // const matchesSearch = searchTerm.toLowerCase()report?.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const updateReportStatus = async (reportId: string, newStatus: ReportStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Không thể cập nhật trạng thái');

            success('Thành công', 'Cập nhật trạng thái báo cáo thành công');
            await loadData();
        } catch (err) {
            console.error(err);
            error('Lỗi', 'Không thể cập nhật trạng thái báo cáo');
        }
    };

    const handleViewDetail = (reportId: string) => {
        setSelectedReportId(reportId);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReportId(null);
        loadData();
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;

        try {
            const response = await fetch(`http://localhost:3000/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Không thể xóa báo cáo');

            success('Thành công', 'Đã xóa báo cáo');
            await loadData();
        } catch (err) {
            console.error(err);
            error('Lỗi', 'Không thể xóa báo cáo');
        }
    };

    const getStatusInfo = (status: ReportStatus) => {
        const statusMap = {
            pending: { text: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
            reviewed: { text: 'Đã xem xét', color: 'text-blue-600 bg-blue-100', icon: AlertTriangle },
            resolved: { text: 'Đã giải quyết', color: 'text-green-600 bg-green-100', icon: CheckCircle },
        };
        return statusMap[status] || statusMap.pending;
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
                    <p className="text-gray-600">Xem và xử lý báo cáo từ người dùng</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-gray-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đã xem xét</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo, người báo cáo, phòng trọ hoặc địa điểm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="in_progress">Đang xử lý</option>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="dismissed">Đã bác bỏ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Danh sách báo cáo ({filteredReports.length})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người báo cáo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phòng trọ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nội dung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày báo cáo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => {
                                const statusInfo = getStatusInfo(report.status);
                                const IconComponent = statusInfo.icon;

                                return (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{report.reportId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{report.roomId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs">
                                                <p className="font-medium text-gray-900 mb-1">{report.reason}</p>
                                                <p className="line-clamp-2 text-gray-600">{report.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <IconComponent className="w-3 h-3 mr-1" />
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(report.reportDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateReportStatus(report.reportId, 'resolved')}
                                                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                            title="Đánh dấu đã giải quyết"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateReportStatus(report.reportId, 'reviewed')}
                                                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Bác bỏ báo cáo"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {report.status === 'reviewed' && (
                                                    <button
                                                        onClick={() => updateReportStatus(report.reportId, 'resolved')}
                                                        className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                        title="Đánh dấu đã giải quyết"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {report.status === 'resolved' && (
                                                    <button
                                                        onClick={() => updateReportStatus(report.reportId, 'reviewed')}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Bác bỏ báo cáo"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {/* <button
                                                    onClick={() => handleDeleteReport(report.reportId)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Xóa báo cáo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredReports.length === 0 && (
                    <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Không tìm thấy báo cáo nào</p>
                        <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default UserReport;