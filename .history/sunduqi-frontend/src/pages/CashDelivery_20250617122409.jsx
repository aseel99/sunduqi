import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function CashDelivery() {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [matchedAmount, setMatchedAmount] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [inCustody, setInCustody] = useState([]);

  const token = localStorage.getItem('token');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user && date) fetchMatchedTotal();
  }, [user, date]);

  useEffect(() => {
    fetchInCustody();
  }, []);

  const fetchMatchedTotal = async () => {
    try {
      const res = await axios.get('/cash-deliveries/matched-confirmed-total', {
        params: { user_id: user.id, branch_id: user.branch_id, date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatchedAmount(res.data.total);
    } catch {
      setMatchedAmount(null);
      toast.error('لا يوجد مطابقات لهذا اليوم.');
    }
  };

  const fetchInCustody = async () => {
    try {
      const res = await axios.get('/cash-deliveries/in-custody', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInCustody(res.data);
    } catch (err) {
      console.error(err);
      toast.error('فشل في تحميل بيانات العهدة');
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (!date) return toast.error('يرجى اختيار التاريخ');
    if (!matchedAmount) return toast.error('لا يوجد مبلغ مطابق لإرساله');
    setLoading(true);
    try {
      await axios.post('/cash-deliveries', {
        date,
        delivered_amount: matchedAmount,
        notes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم تسليم الكاش بنجاح');
      setMatchedAmount(null);
      setNotes('');
    } catch {
      toast.error('فشل في تسليم الكاش');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOnly = async () => {
    if (!date) return toast.error('يرجى اختيار التاريخ');
    if (!matchedAmount) return toast.error('لا يوجد مبلغ مطابق');
    try {
      await axios.post('/cash-deliveries/close-only', {
        date,
        total_matched: matchedAmount,
        notes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم إغلاق الصندوق بنجاح');
      fetchInCustody();
    } catch {
      toast.error('فشل في الإغلاق');
    }
  };

  const handleDeliverAfterClosure = async (id) => {
    try {
      await axios.post('/cash-deliveries/deliver-after-closure', { id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم التسليم بنجاح');
      fetchInCustody();
    } catch {
      toast.error('فشل في التسليم');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-xl shadow font-[Tajawal] text-right" dir="rtl">
      <div className="flex justify-center mb-4 gap-2">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'new' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('new')}
        >تسليم جديد</button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'custody' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('custody')}
        >المبالغ في العهدة</button>
      </div>

      {activeTab === 'new' && (
        <form onSubmit={handleDeliver} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">تاريخ المطابقة</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {matchedAmount !== null && (
            <div>
              <label className="block mb-1 font-medium">المبلغ المطابق</label>
              <input
                type="text"
                readOnly
                value={`${Number(matchedAmount).toFixed(2)} ₪`}
                className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-800"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows={3}
              placeholder="اكتب ملاحظاتك هنا"
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleCloseOnly}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >إغلاق بدون تسليم</button>

            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              disabled={loading || !matchedAmount}
            >{loading ? 'جارٍ التسليم...' : 'تسليم الكاش'}</button>
          </div>
        </form>
      )}

      {activeTab === 'custody' && (
        <div className="space-y-4">
          {inCustody.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد مبالغ في العهدة حالياً.</p>
          ) : inCustody.map((item) => (
            <div key={item.id} className="border rounded p-4 bg-gray-50">
              <p><span className="font-bold">التاريخ:</span> {item.date}</p>
              <p><span className="font-bold">المبلغ:</span> {Number(item.delivered_amount).toFixed(2)} ₪</p>
              <button
                onClick={() => handleDeliverAfterClosure(item.id)}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
              >تسليم الآن</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
