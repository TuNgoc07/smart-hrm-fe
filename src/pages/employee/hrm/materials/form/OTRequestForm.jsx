/**
 * OTRequestForm.jsx
 *
 * Pipeline khi employee điền form:
 *  1. Chọn otDate → gọi GET /api/employee/day-type?date=... → nhận dayType
 *  2. Hiển thị badge ngày (thường/nghỉ/lễ) + rate tương ứng (150/200/300%)
 *  3. Chọn startTime + endTime → tính số giờ OT ngay trên UI
 *  4. Khi submit → NewRequestScreen gửi {otDate, startTime, endTime, dayType, ...} lên backend
 *  5. Backend tự verify dayType + tính calculatedPay chính thức
 */
import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** Màu badge theo loại ngày */
const DAY_TYPE_CONFIG = {
  normal:  { label: 'Ngày thường', rate: '≥ 150%', badge: 'bg-blue-100 text-blue-700',   icon: 'work' },
  weekend: { label: 'Ngày nghỉ T7/CN', rate: '≥ 200%', badge: 'bg-orange-100 text-orange-700', icon: 'weekend' },
  holiday: { label: 'Ngày lễ / Tết', rate: '≥ 300%', badge: 'bg-red-100 text-red-700',  icon: 'celebration' },
};

/** Tính số giờ OT từ startTime và endTime (HH:mm), xử lý qua midnight */
function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // qua midnight
  return Math.round(mins / 60 * 100) / 100;
}

export default function OTRequestForm({ formData, onChange }) {
  // dayInfo: { dayType, label } — kết quả từ API auto-detect
  const [dayInfo, setDayInfo] = useState(null);
  const [detectLoading, setDetectLoading] = useState(false);

  // ── Bước 1: Khi chọn ngày → gọi API detect ───────────────────────────────
  const handleDateChange = async (date) => {
    // Cập nhật form ngay để UI phản hồi nhanh
    onChange({ ...formData, otDate: date, dayType: '' });
    if (!date) { setDayInfo(null); return; }

    setDetectLoading(true);
    try {
      // Pipeline: GET /api/employee/day-type?date=YYYY-MM-DD → { dayType, label }
      const res  = await fetch(`${API_BASE_URL}/api/employee/day-type?date=${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDayInfo(data);
        // Đưa dayType vào formData để NewRequestScreen gửi kèm payload
        onChange({ ...formData, otDate: date, dayType: data.dayType });
      }
    } catch {
      setDayInfo(null);
    } finally {
      setDetectLoading(false);
    }
  };

  const cfg     = DAY_TYPE_CONFIG[dayInfo?.dayType] || null;
  const otHours = calcHours(formData.startTime, formData.endTime);

  return (
    <div className="space-y-5">
      {/* ── Ngày OT ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Ngày OT <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.otDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Bước 2: Hiển thị kết quả auto-detect ──────────────────────── */}
        {detectLoading && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
            Đang kiểm tra loại ngày...
          </p>
        )}
        {cfg && !detectLoading && (
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 border ${cfg.badge.replace('text-', 'border-').replace(/\w+-\d+/, 'current')}`}>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${cfg.badge.split(' ')[1]}`}>{cfg.icon}</span>
              <div>
                <span className={`text-xs font-bold ${cfg.badge.split(' ')[1]}`}>{cfg.label}</span>
                {dayInfo?.dayType === 'weekend' && (
                  <p className="text-[10px] text-orange-600 mt-0.5">⚠️ Cần approval từ HR trước khi làm</p>
                )}
                {dayInfo?.dayType === 'holiday' && (
                  <p className="text-[10px] text-red-600 mt-0.5">⚠️ Ngày lễ — cần approval đặc biệt</p>
                )}
              </div>
            </div>
            <span className={`text-sm font-extrabold ${cfg.badge.split(' ')[1]}`}>{cfg.rate}</span>
          </div>
        )}
      </div>

      {/* ── Giờ OT ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giờ bắt đầu *</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => onChange({ ...formData, startTime: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giờ kết thúc *</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => onChange({ ...formData, endTime: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Bước 3: Hiển thị số giờ OT tính toán ──────────────────────────── */}
      {otHours > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex items-center justify-between border">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="material-symbols-outlined text-primary text-base">schedule</span>
            <span>Số giờ OT</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-primary">{otHours}h</span>
            {cfg && (
              <p className="text-[10px] text-slate-400">
                {/* Công thức hiển thị để nhân viên tham khảo */}
                Lương giờ × {cfg.rate} × {otHours}h
              </p>
            )}
          </div>
        </div>
      )}

      {/* Policy reminder inline ─────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        <strong>Điều 107 BLLĐ 2019:</strong> OT phải được sự đồng ý của người lao động và
        approval từ manager <strong>trước khi thực hiện</strong>.
        Tối đa 40h/tháng, 200h/năm (300h ngành đặc thù).
      </div>
    </div>
  );
}
