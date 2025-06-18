import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function CashDelivery() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [closedOnly, setClosedOnly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/cash-matching/open-session-summary');
      if (!res.data.has_opening) {
        toast.warn('لا يوجد افتتاح مفتوح. يرجى فتح كاش أولاً.');
        return;
      }
      setSummary(res.data);
    } catch (err) {
      toast.error('فشل في تحميل البيانات.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary) return toast.error('لا يوجد بيانات حالياً');

    setLoading(true);

    try {
      await axios.post('/cash-deliveries', {
        delivered_amount: closedOnly ? 0 : summary.expected_total,
        notes,
        date: new Date().toISOString().split('T')[0],
        is_closed_only: closedOnly
      });

      toast.success(closedOnly ? '✅ تم إغلاق الصندوق بدون تسليم' : '✅ تم تسليم الكاش بنجاح');
      setSubmitted(true);
      setSummary(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في العملية');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center text-green-600 font-bold mt-10 font-[Tajawal]">
        ✅ {closedOnly ? 'تم الإغلاق بدون تسليم' : 'تم تسليم الكاش بنجاح'}.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-right font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-yellow-600 text-center">تسليم / إغلاق الكاش</h2>

      {summary ? (
        <>
          <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border mb-6">
            <p>📦 <span className="font-semibold">الرصيد الافتتاحي:</span> {Number(summary.opening_balance).toFixed(2)} ₪</p>
            <p>💰 <span className="font-semibold">الإيرادات:</span> {Number(summary.total_receipts).toFixed(2)} ₪</p>
            <p>💸 <span className="font-semibold">المصروفات:</span> {Number(summary.total_disbursements).toFixed(2)} ₪</p>
            <p className="text-green-700 font-semibold">المبلغ المراد تسليمه: {Number(summary.expected_total).toFixed(2)} ₪</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ملاحظات */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">ملاحظات (اختياري)</label>
              <textarea
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات هنا"
              />
            </div>

            {/* اختيار تسليم أم لا */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="closeOnly"
                checked={closedOnly}
                onChange={(e) => setClosedOnly(e.target.checked)}
              />
              <label htmlFor="closeOnly" className="text-sm text-gray-700 font-medium">إغلاق بدون تسليم</label>
            </div>

            {/* زر التأكيد */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm font-semibold"
            >
              {loading ? 'جاري التنفيذ...' : closedOnly ? 'تأكيد الإغلاق فقط' : 'تأكيد التسليم'}
            </button>
          </form>
        </>
      ) : (
        <p className="text-center text-gray-500">لا توجد بيانات متاحة حالياً.</p>
      )}
    </div>
  );
}
