import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function CashDelivery() {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [matchedAmount, setMatchedAmount] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user && date) {
      fetchMatchedTotal();
    }
  }, [user, date]);

  const fetchMatchedTotal = async () => {
    try {
      const res = await axios.get('/cash-deliveries/matched-confirmed-total', {
        params: {
          user_id: user.id,
          branch_id: user.branch_id,
          date,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMatchedAmount(res.data.total);
    } catch (err) {
      setMatchedAmount(null);
      toast.error('لا يوجد مطابقات لهذا اليوم.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) return toast.error('يرجى اختيار التاريخ');
    if (!matchedAmount) return toast.error('لا يوجد مبلغ مطابق لإرساله');

    setLoading(true);

    try {
      await axios.post(
        '/cash-deliveries',
        {
          date,
          delivered_amount: matchedAmount,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('تم تسليم الكاش بنجاح');
      setNotes('');
      setMatchedAmount(null);
    } catch (err) {
      toast.error('فشل في تسليم الكاش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-right font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-yellow-600 text-center">تسليم الكاش</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* التاريخ */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">تاريخ المطابقة</label>
          <input
            type="date"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-yellow-400 focus:border-yellow-400 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* المبلغ المطابق */}
        {matchedAmount !== null && (
          <div>
            <label className="block mb-1 font-medium text-gray-700">إجمالي المبلغ المطابق</label>
            <input
              type="text"
              className="w-full bg-gray-100 border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-800 font-semibold"
              value={`${Number(matchedAmount).toFixed(2)} ₪`}
              readOnly
            />
          </div>
        )}

        {/* الملاحظات */}
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

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading || !matchedAmount}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'جاري التسليم...' : 'تأكيد التسليم'}
        </button>
      </form>
    </div>
  );
}
