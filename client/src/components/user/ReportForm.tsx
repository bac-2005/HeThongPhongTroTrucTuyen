import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import '../../css/ReportForm.css';
import { buildHeaders } from '../../utils/config';

type ReportApiA = {
  _id: string;
  reportId: string;
  reporterId: string;
  roomId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reportDate?: string;       // ISO
  adminNote?: string;
  createdAt?: string;        // ISO
  title?: never;
  description?: never;
  __v?: number;
};

type ReportApiB = {
  _id: string;
  reportId: string;
  reporterId: string;
  roomId: string;
  title: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt?: string;        // ISO
  adminNote?: string;
  reportDate?: string;       // đôi khi có/không
  __v?: number;
  reason?: never;
};

// UI chuẩn hoá
type ReportUI = {
  id: string;                // reportId | _id
  roomId: string;
  reporterId?: string;
  title?: string;            // nếu có
  message: string;           // reason | description
  status: 'pending' | 'reviewed' | 'resolved';
  date: string;              // ưu tiên reportDate, fallback createdAt
  adminNote?: string;
};

interface ReportFormProps {
  roomId: string;
  // reporterId?: string; // nếu có auth, có thể truyền xuống để POST
}

// map về UI
const mapApiToUI = (r: ReportApiA | ReportApiB): ReportUI => {
  const id = (r as any).reportId || (r as any)._id;
  const status = (r as any).status as ReportUI['status'];
  const date = (r as any).reportDate || (r as any).createdAt || new Date().toISOString();
  const reporterId = (r as any).reporterId;

  // trường hợp A: có 'reason'
  if ((r as ReportApiA).reason !== undefined) {
    return {
      id,
      roomId: r.roomId,
      reporterId,
      message: (r as ReportApiA).reason,
      status,
      date,
      adminNote: (r as ReportApiA).adminNote || '',
    };
  }

  // trường hợp B: có 'title/description'
  const rb = r as ReportApiB;
  const title = rb.title;
  const message = rb.description || rb.title || '';
  return {
    id,
    roomId: r.roomId,
    reporterId,
    title,
    message,
    status,
    date,
    adminNote: rb.adminNote || '',
  };
};

const ReportForm: React.FC<ReportFormProps> = ({ roomId }) => {
  const [type, setType] = useState('');      // UI-only: report/support/owner
  const [message, setMessage] = useState('');
  const [reports, setReports] = useState<ReportUI[]>([]);
  const [loading, setLoading] = useState(false);

  // lấy danh sách report theo roomId
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/reports/room/${encodeURIComponent(roomId)}`,
          { headers: buildHeaders() }
        );
        const json: { success: boolean; data?: Array<ReportApiA | ReportApiB> } = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : [];
        const mapped = arr.map(mapApiToUI);
        // sort mới -> cũ theo date
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReports(mapped);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phản ánh:', err);
        setReports([]);
      }
    };
    if (roomId) load();
  }, [roomId]);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const reviewed = reports.filter(r => r.status === 'reviewed').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    return { total, pending, reviewed, resolved };
  }, [reports]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!type || !message.trim()) return;

    // Payload theo backend dạng A (ổn định nhất trong mẫu bạn đưa):
    // { roomId, reason, reportDate, /* reporterId?: string (nếu cần) */ }
    const payload: any = {
      roomId,
      title: type,
      description: `${type.toUpperCase()}: ${message.trim()}`,
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gửi phản ánh thất bại');

      // giả định trả về { success, data: ReportApiA|ReportApiB } hoặc trả thẳng object
      const saved = await response.json();
      const apiEntity = saved?.data ?? saved;
      const ui = mapApiToUI(apiEntity);

      // thêm vào đầu danh sách
      setReports(prev => [ui, ...prev]);

      alert('✅ Phản ánh đã được gửi!');
      setType('');
      setMessage('');
    } catch (err) {
      console.error('Lỗi khi gửi phản ánh:', err);
      alert('❌ Gửi phản ánh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s: ReportUI['status']) => {
    const map: Record<ReportUI['status'], string> = {
      pending: 'badge badge-pending',
      reviewed: 'badge badge-reviewed',
      resolved: 'badge badge-resolved',
    };
    const text: Record<ReportUI['status'], string> = {
      pending: 'Đang xử lý',
      reviewed: 'Đã tiếp nhận',
      resolved: 'Đã xử lý',
    };
    return <span className={map[s]}>{text[s]}</span>;
  };

  return (
    <div className="report-form">
      <h3>📩 Gửi phản ánh / Yêu cầu hỗ trợ</h3>

      {/* thống kê nhanh */}
      <div className="report-stats">
        <span><strong>{stats.total}</strong> báo cáo</span>
        <span className="dot">•</span>
        <span>{stats.pending} đang xử lý</span>
        <span className="dot">•</span>
        <span>{stats.reviewed} đã tiếp nhận</span>
        <span className="dot">•</span>
        <span>{stats.resolved} đã xử lý</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Loại phản ánh:
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">-- Chọn loại --</option>
            <option value="Phản ánh chất lượng phòng">Phản ánh chất lượng phòng</option>
            <option value="Yêu cầu hỗ trợ từ hệ thống">Yêu cầu hỗ trợ từ hệ thống</option>
            <option value="Phản ánh chủ trọ">Phản ánh chủ trọ</option>
          </select>
        </label>

        <label>
          Nội dung phản ánh:
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Nhập nội dung phản ánh..."
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi phản ánh'}
        </button>
      </form>

      {reports.length > 0 && (
        <div className="report-history">
          <h4>📄 Các phản ánh đã gửi:</h4>
          <ul>
            {reports.map(r => (
              <li key={r.id}>
                <div className="report-row">
                  <div className="report-main">
                    <strong>{r.title || 'Nội dung'}</strong>
                    <div className="report-message">{r.message}</div>
                    <div className="report-meta">
                      {statusBadge(r.status)}
                      <span className="dot">•</span>
                      <small>🕒 {new Date(r.date).toLocaleString('vi-VN')}</small>
                      {r.adminNote && r.adminNote.trim() && (
                        <>
                          <span className="dot">•</span>
                          <small>📝 {r.adminNote}</small>
                        </>
                      )}
                    </div>
                  </div>
                  {r.reporterId && (
                    <div className="report-side">
                      <small>👤 {r.reporterId}</small>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportForm;
