import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function CashDelivery() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchedAmount, setMatchedAmount] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [inCustody, setInCustody] = useState([]);
  const [delivered, setDelivered] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user && date) fetchMatchedTotal();
  }, [user, date]);

  useEffect(() => {
    fetchInCustody();
    fetchDelivered();
  }, []);

  const fetchMatchedTotal = async () => {
    try {
      const res = await axios.get('/cash-deliveries/matched-confirmed-total', {
        params: { user_id: user.id, branch_id: user.branch_id, date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatchedAmount(res.data.total || 0);
    } catch {
      setMatchedAmount(null);
      toast.error('لا يوجد مطابقات لهذا التاريخ.');
    }
  };

  const fetchInCustody = async () => {
    try {
      const res = await axios.get('/cash-deliveries/in-custody', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInCustody(res.data || []);
    } catch {
      toast.error('فشل في تحميل مبالغ العهدة.');
    }
  };

  const fetchDelivered = async () => {
    try {
      const res = await axios.get('/cash-deliveries/today-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDelivered(res.data?.delivered || []);
    } catch {
      toast.error('فشل في تحميل المبالغ التي تم تسليمها.');
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (!date || !matchedAmount) return toast.error('يرجى تحديد تاريخ ومبلغ المطابقة');

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
      fetchDelivered();
    } catch {
      toast.error('فشل في تسليم الكاش.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOnly = async () => {
    if (!date || !matchedAmount) return toast.error('يرجى تحديد تاريخ ومبلغ المطابقة');
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
      toast.error('فشل في إغلاق الصندوق.');
    }
  };

  const handleDeliverAfterClosure = async (id) => {
    try {
      await axios.post('/cash-deliveries/deliver-closed', { id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم التسليم بنجاح');
      fetchInCustody();
      fetchDelivered();
    } catch {
      toast.error('فشل في التسليم.');
    }
  };

  const tabs = [
    { id: 'today', label: 'تسليم / إغلاق' },
    { id: 'custody', label: 'عهدتي' },
    { id: 'delivered', label: 'تم التسليم' }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-xl shadow font-[Tajawal]" dir="rtl">
      <div className="flex justify-center mb-4 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded ${activeTab === tab.id ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <form onSubmit={handleDeliver} className="space-y-4">
          <div>
            <label>تاريخ المطابقة</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {matchedAmount !== null && (
            <div>
              <label>المبلغ المطابق</label>
              <input
                readOnly
                value={`${Number(matchedAmount).toFixed(2)} ₪`}
                className="w-full border px-4 py-2 bg-gray-100"
              />
            </div>
          )}

          <div>
            <label>ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows={2}
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleCloseOnly}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              إغلاق بدون تسليم
            </button>
            <button
              type="submit"
              disabled={loading || !matchedAmount}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              {loading ? 'جاري التسليم...' : 'تسليم الكاش'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'custody' && (
        <div className="space-y-4">
          {inCustody.length === 0 ? (
            <p className="text-center text-gray-500">لا يوجد مبالغ تحت عهدتك حالياً.</p>
          ) : inCustody.map(item => (
            <div key={item.id} className="border p-4 rounded bg-gray-100">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المبلغ:</strong> {Number(item.delivered_amount).toFixed(2)} ₪</p>
              <button
                onClick={() => handleDeliverAfterClosure(item.id)}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
              >
                تسليم الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'delivered' && (
        <div className="space-y-4">
          {delivered.length === 0 ? (
            <p className="text-center text-gray-500">لا يوجد عمليات تسليم بعد.</p>
          ) : delivered.map((item, idx) => (
            <div key={idx} className="border p-4 rounded bg-gray-50">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المبلغ:</strong> {Number(item.delivered_amount).toFixed(2)} ₪</p>
              <p><strong>تم التوثيق:</strong> {item.is_verified ? 'نعم' : 'لم يتم'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
