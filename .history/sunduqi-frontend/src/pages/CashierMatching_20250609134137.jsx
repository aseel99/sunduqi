// CashierMatching.jsx
// Displays the cashier's summary for a specific branch and allows them to confirm matching and deliver matched cash.

import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function CashierMatching() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [actualTotal, setActualTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [matchedTotal, setMatchedTotal] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    const loadSummary = async () => {
      try {
        const res = await axios.get('/cash-matching/matching-summary', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error('❌ Load summary failed:', err);
        setMessage('فشل تحميل البيانات');
      }
    };

    const loadMatchedTotal = async () => {
      try {
        const res = await axios.get('/cash-deliveries/matched-total', {
          params: { user_id: user.id, branch_id: user.branch_id, date: today },
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatchedTotal(res.data.matched_total);
      } catch (err) {
        console.error('❌ Load matched total failed:', err);
      }
    };

    loadSummary();
    loadMatchedTotal();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/cash-matching/confirm',
        {
          user_id: user.id,
          branch_id: user.branch_id,
          expected_total: summary.expected_total,
          actual_total: parseFloat(actualTotal),
          notes,
          date: new Date().toISOString().split('T')[0],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ تم حفظ المطابقة بنجاح');
    } catch (err) {
      console.error('❌ Submit failed:', err);
      setMessage('❌ فشل الحفظ');
    }
  };

  const handleDeliver = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/cash-deliveries/deliver-matched',
        {
          user_id: user.id,
          branch_id: user.branch_id,
          amount: matchedTotal,
          date: new Date().toISOString().split('T')[0],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ تم تسليم الرصيد المطابق بنجاح');
    } catch (err) {
      console.error('❌ Deliver failed:', err);
      setMessage('❌ فشل تسليم الرصيد');
    }
  };

  if (!summary) return <div className="text-center mt-10">جاري التحميل...</div>;

  const difference = actualTotal ? (parseFloat(actualTotal) - summary.expected_total).toFixed(2) : '---';

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">مطابقة الصندوق</h2>
        <div className="space-y-2 text-sm mb-4">
          <div>الإيرادات: {summary.total_receipts} د.أ</div>
          <div>المصروفات: {summary.total_disbursements} د.أ</div>
          <div className="font-bold">الرصيد المتوقع: {summary.expected_total} د.أ</div>
        </div>
        {message && <div className="mb-4 text-blue-600 font-bold">{message}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-1 text-sm">الرصيد الفعلي</label>
          <input
            type="number"
            required
            value={actualTotal}
            onChange={(e) => setActualTotal(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <div className="mb-4 text-sm">
            الفرق: <span className="font-bold text-red-600">{difference} د.أ</span>
          </div>
          <label className="block mb-1 text-sm">ملاحظات</label>
          <textarea
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            حفظ المطابقة
          </button>
        </form>

        {matchedTotal !== null && (
          <>
            <div className="mt-6 text-green-700 text-sm font-bold">
              الرصيد المطابق لهذا اليوم: {matchedTotal.toLocaleString()} د.أ
            </div>
            <button
              onClick={handleDeliver}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              تسليم الرصيد المطابق
            </button>
          </>
        )}
      </div>
    </div>
  );
}
