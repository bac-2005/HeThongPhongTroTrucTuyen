import axios from 'axios';


const API_BASE = 'http://localhost:3000';


export type CreateVnpayPayload = {
    tenantId: string;
    contractId: string;
    amount: number; // VND (chưa *100)
    extraNote?: string;
    invoiceId?: string;
};


export type CreateVnpayResponse = {
    payUrl: string;
    vnpTxnRef: string;
    paymentId: string;
};


export const paymentService = {
    async createVnpayPayment(data: CreateVnpayPayload, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const t = token || localStorage.getItem('access_token') || localStorage.getItem('token');
        if (t) headers.Authorization = `Bearer ${t}`;


        const res = await axios.post<CreateVnpayResponse>(
            `${API_BASE}/payments/vnpay/create`,
            data,
            { headers }
        );
        return res.data;
    },
    async createVnpayPaymentInvoi(data: CreateVnpayPayload, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const t = token || localStorage.getItem('access_token') || localStorage.getItem('token');
        if (t) headers.Authorization = `Bearer ${t}`;


        const res = await axios.post<CreateVnpayResponse>(
            `${API_BASE}/payments/vnpay/createInvoice`,
            data,
            { headers }
        );
        return res.data;
    },


    async getPaymentResultByRef(vnpTxnRef: string, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const t = token || localStorage.getItem('access_token') || localStorage.getItem('token');
        if (t) headers.Authorization = `Bearer ${t}`;


        const res = await axios.get(
            `${API_BASE}/payments/payment-result`,
            { params: { ref: vnpTxnRef }, headers }
        );
        return res.data;
    }
};