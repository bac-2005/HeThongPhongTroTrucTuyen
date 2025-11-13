import { Phone, Mail, User, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
    user: any
}

export default function SingleTenantCard({ user }: Props) {
    // Get status styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return {
                    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                    label: 'Hoạt động'
                };
            case 'inactive':
                return {
                    icon: <XCircle className="w-4 h-4 text-red-600" />,
                    label: 'Không hoạt động'
                };
            case 'suspended':
                return {
                    icon: <Clock className="w-4 h-4 text-orange-600" />,
                    label: 'Tạm khóa'
                };
            default:
                return {
                    icon: <XCircle className="w-4 h-4 text-gray-600" />,
                    label: status
                };
        }
    };

    const statusStyle = getStatusStyle(user.status);

    // Get role styling
    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'user':
                return {
                    icon: <User className="w-4 h-4 text-blue-600" />,
                    label: 'Người thuê'
                };
            case 'admin':
                return {
                    icon: <Shield className="w-4 h-4 text-purple-600" />,
                    label: 'Quản trị'
                };
            default:
                return {
                    icon: <User className="w-4 h-4 text-gray-600" />,
                    label: role
                };
        }
    };

    const roleStyle = getRoleStyle(user.role);

    // Generate avatar placeholder
    const getAvatarPlaceholder = (name: string) => {
        return name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-600 text-lg font-medium">
                                {getAvatarPlaceholder(user.fullName)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    {/* Name and Status */}
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {user.fullName}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {statusStyle.icon}
                                <span className="text-sm text-gray-700">{statusStyle.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {roleStyle.icon}
                                <span className="text-sm text-gray-700">{roleStyle.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Phone */}
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Điện thoại</p>
                                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}