/**
 * HolidayCalendarScreen.jsx
 *
 * Màn hình HR Admin quản lý lịch ngày lễ quốc gia Việt Nam.
 *
 * Pipeline:
 *  1. Load → GET /api/hradmin/public-holidays → hiển thị danh sách
 *  2. Thêm  → POST /api/hradmin/public-holidays → refresh list
 *  3. Sửa   → PUT  /api/hradmin/public-holidays → refresh list
 *  4. Xóa   → DELETE /api/hradmin/public-holidays/{id}
 *
 *  DayTypeService backend sẽ tự đọc bảng này khi:
 *   - Nhân viên tạo OT Request → auto-detect dayType
 *   - Tính lương OT → xác định rate 150/200/300%
 */
import React, { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function HolidayCalendarScreen() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode
  const [form, setForm] = useState({ holidayDate: '', holidayName: '', description: '', isRecurring: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Bước 1: Load danh sách ngày lễ ───────────────────────────────────────
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/public-holidays`, { headers: authHeader() });
      const data = await res.json();
      setHolidays(data.status === 'success' ? data.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  // ── Mở modal tạo mới ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm({ holidayDate: '', holidayName: '', description: '', isRecurring: 1 });
    setError('');
    setModalOpen(true);
  };

  // ── Mở modal chỉnh sửa ───────────────────────────────────────────────────
  const openEdit = (h) => {
    setEditTarget(h);
    setForm({ holidayDate: h.holidayDate, holidayName: h.holidayName, description: h.description || '', isRecurring: h.isRecurring ?? 1 });
    setError('');
    setModalOpen(true);
  };

  // ── Bước 2/3: Lưu (create hoặc update) ───────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const isEdit = !!editTarget;
      const url    = `${API_BASE_URL}/api/hradmin/public-holidays`;
      const method = isEdit ? 'PUT' : 'POST';
      const body   = isEdit ? { ...form, holidayId: editTarget.holidayId } : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setModalOpen(false);
        fetchHolidays();
      } else {
        setError(data.message || 'Lưu thất bại');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Bước 4: Xóa ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Xóa ngày lễ này?')) return;
    await fetch(`${API_BASE_URL}/api/hradmin/public-holidays/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    fetchHolidays();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Holiday Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý ngày lễ quốc gia — dùng để phân loại OT rate (150% / 200% / 300%)
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-base">add</span>
          Thêm ngày lễ
        </button>
      </div>

      {/* Info banner — giải thích pipeline */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
        <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
        <div>
          <strong>Pipeline:</strong> Khi nhân viên chọn ngày OT → hệ thống tự kiểm tra bảng này →
          nếu là ngày lễ → áp rate <strong>300%</strong>; nếu T7/CN → <strong>200%</strong>; ngày thường → <strong>150%</strong>.
        </div>
      </div>

      {/* Rate legend */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ngày thường (T2–T6)', rate: '≥ 150%', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Ngày nghỉ hàng tuần (T7/CN)', rate: '≥ 200%', color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Ngày lễ / Tết', rate: '≥ 300%', color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(({ label, rate, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-xs font-bold uppercase">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{rate}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          <h3 className="font-bold">Danh sách ngày lễ</h3>
          <span className="ml-auto text-xs text-slate-400">{holidays.length} ngày</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b">
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Tên ngày lễ</th>
                <th className="px-6 py-3">Ghi chú</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Đang tải...</td></tr>
              ) : holidays.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Chưa có ngày lễ nào. Nhấn "Thêm ngày lễ" để bắt đầu.</td></tr>
              ) : (
                holidays.map((h) => (
                  <tr key={h.holidayId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-primary">{formatDate(h.holidayDate)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{h.holidayName}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{h.description || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        h.isRecurring === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {h.isRecurring === 1 ? 'Hàng năm' : 'Cố định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => openEdit(h)}
                        className="p-1 rounded hover:bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(h.holidayId)}
                        className="p-1 rounded hover:bg-red-50 text-red-400">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">
                {editTarget ? 'Chỉnh sửa ngày lễ' : 'Thêm ngày lễ mới'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              {/* Ngày */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ngày *</label>
                <input type="date" required value={form.holidayDate}
                  onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Tên */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên ngày lễ *</label>
                <input type="text" required value={form.holidayName}
                  onChange={(e) => setForm({ ...form, holidayName: e.target.value })}
                  placeholder="VD: Tết Dương lịch"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ghi chú</label>
                <input type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tùy chọn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Loại */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Loại *</label>
                <div className="flex gap-3">
                  {[
                    { value: 1, label: 'Hàng năm (MM-DD)', desc: 'Áp dụng mỗi năm. Dùng cho 1/1, 30/4, 1/5, 2/9.' },
                    { value: 0, label: 'Cố định (YYYY-MM-DD)', desc: 'Chỉ năm đó. Dùng cho Tết Âm lịch, Giỗ Tổ.' },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-xs transition ${
                      form.isRecurring === value ? 'border-primary bg-primary/5' : 'border-slate-200'
                    }`}>
                      <input type="radio" className="hidden" checked={form.isRecurring === value}
                        onChange={() => setForm({ ...form, isRecurring: value })} />
                      <span className="font-bold block">{label}</span>
                      <span className="text-slate-400 mt-1 block">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border text-slate-600 text-sm font-bold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
                  {saving ? 'Đang lưu...' : (editTarget ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
