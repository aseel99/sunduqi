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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/cash-matching/matching-summary', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
          },
        });
        setSummary(res.data);
      } catch (err) {
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/cash-matching/confirm', {
        user_id: user.id,
        branch_id: user.branch_id,
        expected_total: summary.expected_total,
        actual_total: actualTotal,
        notes,
        date: new Date().toISOString().split('T')[0], // تاريخ اليوم
      });
      toast.success('تم تأكيد المطابقة بنجاح');
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      toast.error(msg);
    }
  };

  if (loading) return <div className="text-center p-4">جاري التحميل...</div>;
  if (!summary) return <div className="text-center text-red-600">لا يوجد بيانات للمطابقة</div>;

  return (
    <div className="p-6 bg-white rounded shadow text-right max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">مطابقة الكاش لليوم</h2>

      <div className="space-y-2 text-sm">
        <div>الرصيد الافتتاحي: <strong>{summary.opening_balance}</strong></div>
        <div>الإيرادات: <strong>{summary.total_receipts}</strong></div>
        <div>المصروفات: <strong>{summary.total_disbursements}</strong></div>
        <div className="text-green-700">الرصيد المتوقع: <strong>{summary.expected_total}</strong></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          المبلغ الفعلي:
          <input
            type="number"
            step="0.01"
            value={actualTotal}
            onChange={(e) => setActualTotal(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
            required
          />
        </label>

        <label className="block text-sm">
          ملاحظات (اختياري):
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
            rows="3"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          تأكيد المطابقة
        </button>
      </form>
    </div>
  );
}
