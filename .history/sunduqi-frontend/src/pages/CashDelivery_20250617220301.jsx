import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function CashDelivery() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState('');
  const [matchedAmount, setMatchedAmount] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('new');
  const [inCustody, setInCustody] = useState([]);
  const [deliveredList, setDeliveredList] = useState([]);

  // 🔁 تحميل العهدة والتسليمات
  useEffect(() => {
    fetchInCustody();
    fetchDelivered();
  }, []);

  // ⬅️ تحميل المبلغ المطابق
  useEffect(() => {
    if (user && date) fetchMatchedTotal();
  }, [user, date]);

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
      const res = await axios.get('/cash-deliveries', {
        params: {
          is_verified: false,
          is_closed_only: true,
          branch_id: user.branch_id
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setInCustody(res.data.data || []);
    } catch {
      toast.error('فشل في تحميل بيانات العهدة');
    }
  };

  const fetchDelivered = async () => {
    try {
      const res = await axios.get('/cash-deliveries', {
        params: {
          is_verified: true,
          is_closed_only: false,
          branch_id: user.branch_id
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveredList(res.data.data || []);
    } catch {
      toast.error('فشل في تحميل التسليمات');
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (!date) return toast.error('يرجى اختيار التاريخ');
    if (!matchedAmount) return toast.error('لا يوجد مبلغ مطابق لإرساله');

    setLoading(true);
    try {
      await axios.post('/cash-deliveries', { date, delivered_amount: matchedAmount, notes }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ تم تسليم الكاش');
      setMatchedAmount(null);
      setNotes('');
      fetchDelivered();
    } catch {
      toast.error('❌ فشل في تسليم الكاش');
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
      toast.success('✅ تم إغلاق الصندوق');
      fetchInCustody();
    } catch {
      toast.error('❌ فشل في الإغلاق');
    }
  };

  const handleDeliverAfterClosure = async (id) => {
    try {
      await axios.post('/cash-deliveries/deliver-closed', { id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ تم التسليم');
      fetchInCustody();
      fetchDelivered();
    } catch {
      toast.error('❌ فشل في التسليم');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow font-[Tajawal] text-right" dir="rtl">
      {/* ✅ التبويبات */}
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded ${activeTab === 'new' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>تسليم جديد</button>
        <button onClick={() => setActiveTab('custody')} className={`px-4 py-2 rounded ${activeTab === 'custody' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>العهدة</button>
        <button onClick={() => setActiveTab('delivered')} className={`px-4 py-2 rounded ${activeTab === 'delivered' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>تم التسليم</button>
      </div>

      {/* ✅ تبويب تسليم جديد */}
      {activeTab === 'new' && (
        <form onSubmit={handleDeliver} className="space-y-4">
          <label className="block">
            التاريخ:
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </label>

          {matchedAmount !== null && (
            <div>
              <label>المبلغ المطابق:</label>
              <input readOnly value={`${matchedAmount} ₪`} className="w-full mt-1 px-3 py-2 bg-gray-100 border rounded" />
            </div>
          )}

          <label className="block">
            ملاحظات:
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 border rounded" />
          </label>

          <div className="flex gap-4">
            <button type="button" onClick={handleCloseOnly} className="bg-gray-600 text-white px-4 py-2 rounded">إغلاق بدون تسليم</button>
            <button type="submit" disabled={loading} className="bg-yellow-600 text-white px-4 py-2 rounded">
              {loading ? 'جاري التسليم...' : 'تسليم الكاش'}
            </button>
          </div>
        </form>
      )}

      {/* ✅ تبويب العهدة */}
      {activeTab === 'custody' && (
        <div className="space-y-4">
          {inCustody.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد مبالغ في العهدة.</p>
          ) : inCustody.map((item) => (
            <div key={item.id} className="p-4 border rounded bg-gray-50">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المبلغ المتوقع:</strong> {Number(item.delivered_amount).toFixed(2)} ₪</p>
              <button onClick={() => handleDeliverAfterClosure(item.id)} className="mt-2 bg-green-600 text-white px-4 py-1 rounded">تسليم الآن</button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ تبويب تم التسليم */}
      {activeTab === 'delivered' && (
        <div className="space-y-4">
          {deliveredList.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد تسليمات.</p>
          ) : deliveredList.map((item) => (
            <div key={item.id} className="p-4 border rounded bg-green-50">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المبلغ:</strong> {Number(item.delivered_amount).toFixed(2)} ₪</p>
              <p><strong>ملاحظات:</strong> {item.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
