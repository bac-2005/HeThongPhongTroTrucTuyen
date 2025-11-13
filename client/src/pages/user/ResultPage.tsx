import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export type PaymentMessageProps = {
    title?: string;
    message?: string;
};

const ResultPage: React.FC<PaymentMessageProps> = ({
    title = 'Thanh toán thành công',
    message = 'Cảm ơn bạn! Giao dịch của bạn đã được xác nhận.',
}) => {
    const na = () => {
        window.location.href = '/';
    }
    return (
        <div className="min-h-[60vh] w-full grid place-items-center bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow">
                <div className="flex flex-col items-center text-center">
                    <CheckCircle2 className="h-16 w-16 text-emerald-600 mb-4" aria-hidden />
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{message}</p>
                    <button
                        onClick={na}
                        className="mt-6 inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;