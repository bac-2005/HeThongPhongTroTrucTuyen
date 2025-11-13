export const paymentTypes = [
    { value: 'room', label: 'Tiền thuê', unitLabel: 'phòng' },
    { value: 'electricity', label: 'Tiền điện', unitLabel: 'kWh' },
    { value: 'water', label: 'Tiền nước', unitLabel: 'm³' },
    { value: 'service', label: 'Phí dịch vụ', unitLabel: 'dịch vụ' },
    { value: 'parking', label: 'Phí gửi xe', unitLabel: 'xe' },
    { value: 'cleaning', label: 'Phí vệ sinh', unitLabel: 'lần' },
    { value: 'internet', label: 'Phí internet', unitLabel: 'tháng' },
    { value: 'other', label: 'Khác', unitLabel: 'đơn vị' }
];

export const statusOptions = [
    { value: 'pending', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
    { value: 'unpaid', label: 'Quá hạn', color: 'bg-red-100 text-red-800' },
];
