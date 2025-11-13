import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';


const numberFormat = (n: number) => new Intl.NumberFormat('vi-VN').format(n);


const ContractCheckout: React.FC = () => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const location = useLocation() as any;
    const [amount, setAmount] = React.useState<number>(location?.state?.amount || 0);
    const [note, setNote] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');
    const currentUser = React.useMemo(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }, []);

    React.useEffect(() => {
        // Nếu không có amount truyền từ trang trước, có thể fetch hợp đồng để tính (tuỳ backend)
        // Ở đây giữ đơn giản: yêu cầu có state.amount
        if (!amount || !contractId) {
            setError('Thiếu thông tin thanh toán. Vui lòng quay lại trang hợp đồng.');
        }
    }, [amount, contractId]);


    const onPay = async () => {
        if (!contractId || !amount) return;
        try {
            setLoading(true);
            setError('');

            const data: any = await paymentService.createVnpayPayment({
                tenantId: currentUser.id,
                contractId,
                amount,
                extraNote: note
            });
            // // Redirect user sang VNPay
            console.log(data.data.payUrl);
            
            window.location.href = data.data.payUrl;
        } catch (e: any) {
            console.error(e);
            setError(e?.response?.data?.message || 'Không thể tạo giao dịch.');
        } finally {
            setLoading(false);
        }
    };


    const goBack = () => navigate(-1);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-3">Thanh toán hợp đồng</h1>
            <div className="rounded-lg border p-4 space-y-3 shadow-sm">
                <div className="text-sm text-gray-600">Mã hợp đồng</div>
                <div className="text-lg font-medium">{contractId}</div>
                <div className="text-sm text-gray-600">Số tiền thanh toán</div>
                <div className="text-2xl font-bold">{numberFormat(amount)} VND</div>
                <label className="block">
                    <span className="text-sm text-gray-600">Ghi chú (tuỳ chọn)</span>
                    <textarea
                        className="w-full mt-1 border rounded p-2"
                        rows={2}
                        placeholder="Ví dụ: Thanh toán tháng 9"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </label>


                {error && (
                    <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
                )}


                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="px-4 py-2 rounded border"
                        disabled={loading}
                    >Quay lại</button>


                    <button
                        onClick={onPay}
                        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                        disabled={loading || !!error}
                    >{loading ? 'Đang chuyển tới VNPay…' : 'Thanh toán với VNPay'}</button>
                </div>


                <p className="text-xs text-gray-500">
                    Khi bấm "Thanh toán với VNPay", bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch an toàn.
                </p>
            </div>
        </div>
    );
};


export default ContractCheckout;