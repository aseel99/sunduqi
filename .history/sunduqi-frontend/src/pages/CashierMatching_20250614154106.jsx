import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function CashierMatching() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [actualTotal, setActualTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchCreated, setMatchCreated] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/cash-matching/open-session-summary');
        setSummary(res.data);
        if (res.data.has_opening) {
          setActualTotal(Number(res.data.expected_total).toFixed(2));
        }
      } catch (err) {
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/cash-matching', {
        actual_total: actualTotal,
        notes,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('تمت المطابقة بنجاح');
      setMatchCreated(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      toast.error(msg);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-500 font-[Tajawal]">جاري التحميل...</div>;

  if (!summary?.has_opening) {
    return (
      <div className="text-center text-yellow-600 mt-10 font-[Tajawal]">
        لا يمكن تنفيذ المطابقة حالياً. يرجى فتح رصيد أولاً.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow text-right font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">مطابقة الكاش لليوم</h2>

      <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border mb-6">
        <p>📦 <span className="font-semibold">الرصيد الافتتاحي:</span> {Number(summary.opening_balance).toFixed(2)} ₪</p>
        <p>💰 <span className="font-semibold">الإيرادات:</span> {Number(summary.total_receipts).toFixed(2)} ₪</p>
        <p>💸 <span className="font-semibold">المصروفات:</span> {Number(summary.total_disbursements).toFixed(2)} ₪</p>
        <p className="text-green-700 font-semibold">✅ الرصيد المتوقع: {Number(summary.expected_total).toFixed(2)} ₪</p>
      </div>

      {matchCreated ? (
        <div className="text-center text-green-600 font-semibold">✅ تمت المطابقة لهذا اليوم</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">المبلغ الفعلي</label>
            <input
              type="number"
              step="0.01"
              value={actualTotal}
              onChange={(e) => setActualTotal(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">ملاحظات (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm"
              placeholder="أدخل أي ملاحظات هنا"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm font-semibold"
          >
            تأكيد المطابقة
          </button>
        </form>
      )}
    </div>
  );
}
