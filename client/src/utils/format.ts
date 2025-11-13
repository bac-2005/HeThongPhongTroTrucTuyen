export function truncate(str: string, maxLength: number = 40) {
  if (!str) return "";
  return str.length > maxLength
    ? str.slice(0, maxLength) + "..."
    : str;
}

export function convertStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Đang hoạt động",
    expired: "Hết hạn",
    terminated: "Đã chấm dứt",
    cancel: "Hủy hợp đồng",
    pending: "Đang chờ xử lý",
    approved: "Đã phê duyệt",
    rejected: "Bị từ chối",
    available: "Có sẵn",
    single: "Phòng đơn",
    shared: "Phòng chung",
    apartment: "Căn hộ",
    failed: "Thất bại",
    paid: "Thành công",
  };

  return map[status] || "Không xác định";
}


export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};