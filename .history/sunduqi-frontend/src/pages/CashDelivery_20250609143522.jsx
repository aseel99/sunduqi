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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow text-right">
      <h2 className="text-xl font-bold mb-4 text-center">تسليم الكاش</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">تاريخ المطابقة</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {matchedAmount !== null && (
          <div>
            <label className="block mb-1 font-medium">إجمالي المبلغ المطابق</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700"
              value={matchedAmount}
              readOnly
            />
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium">ملاحظات (اختياري)</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل أي ملاحظات هنا"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !matchedAmount}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'جاري التسليم...' : 'تأكيد التسليم'}
        </button>
      </form>
    </div>
  );
}
