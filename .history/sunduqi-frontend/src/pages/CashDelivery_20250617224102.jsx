import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function CashDelivery() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('delivery');

  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [inCustody, setInCustody] = useState([]);

  useEffect(() => {
    if (activeTab === 'delivery') fetchSummary();
    if (activeTab === 'custody') fetchInCustody();
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/cash-matching/open-session-summary');
      if (!res.data.has_opening) {
        toast.warn('⚠️ لا يوجد افتتاح مفتوح. يرجى فتح كاش أولاً.');
        return;
      }
      setSummary(res.data);
    } catch {
      toast.error('فشل في تحميل البيانات.');
    }
  };

  const fetchInCustody = async () => {
    try {
      const res = await axios.get('/cash-deliveries', {
        params: {
          is_verified: false,
          is_closed_only: true,
          branch_id: user.branch_id,
        }
      });
      setInCustody(res.data.data || []);
    } catch {
      toast.error('فشل في تحميل العهدة');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary) return toast.error('لا يوجد بيانات حالياً');

    setLoading(true);
    try {
      await axios.post('/cash-deliveries', {
        delivered_amount: summary.expected_total,
        notes,
        date: new Date().toISOString().split('T')[0]
      });

      toast.success('✅ تم تسليم الكاش بنجاح');
      setSubmitted(true);
      setSummary(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في تسليم الكاش');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOnly = async () => {
    if (!summary) return toast.error('لا يوجد بيانات حالياً');

    setLoading(true);
    try {
      await axios.post('/cash-deliveries/close-only', {
        date: new Date().toISOString().split('T')[0],
        total_matched: summary.expected_total,
        notes
      });

      toast.success('✅ تم إغلاق الصندوق بدون تسليم');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في الإغلاق');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverFromCustody = async (id) => {
    try {
      await axios.post('/cash-deliveries/deliver-closed', { id });
      toast.success('✅ تم تسليم العهدة بنجاح');
      fetchInCustody();
    } catch {
      toast.error('فشل في التسليم');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-right font-[Tajawal]" dir="rtl">
      {/* ✅ التبويبات */}
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setActiveTab('delivery')} className={`px-4 py-2 rounded ${activeTab === 'delivery' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>تسليم الكاش</button>
        <button onClick={() => setActiveTab('custody')} className={`px-4 py-2 rounded ${activeTab === 'custody' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>العهدة</button>
      </div>

      {/* ✅ تبويب التسليم */}
      {activeTab === 'delivery' && (
        submitted ? (
          <div className="text-center text-green-600 font-bold mt-10">✅ تم تسليم الكاش أو إغلاقه بنجاح.</div>
        ) : summary ? (
          <>
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border mb-6">
              <p>📦 <span className="font-semibold">الرصيد الافتتاحي:</span> {Number(summary.opening_balance).toFixed(2)} ₪</p>
              <p>💰 <span className="font-semibold">الإيرادات:</span> {Number(summary.total_receipts).toFixed(2)} ₪</p>
              <p>💸 <span className="font-semibold">المصروفات:</span> {Number(summary.total_disbursements).toFixed(2)} ₪</p>
              <p className="text-green-700 font-semibold">المبلغ المراد تسليمه: {Number(summary.expected_total).toFixed(2)} ₪</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseOnly}
                  disabled={loading}
                  className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md text-sm font-semibold"
                >
                  {loading ? 'جارٍ الإغلاق...' : 'إغلاق بدون تسليم'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm font-semibold"
                >
                  {loading ? 'جاري التسليم...' : 'تأكيد التسليم'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-center text-gray-500">لا توجد بيانات متاحة حالياً.</p>
        )
      )}

      {/* ✅ تبويب العهدة */}
      {activeTab === 'custody' && (
        inCustody.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد مبالغ في العهدة حالياً.</p>
        ) : (
          <div className="space-y-4">
            {inCustody.map((item) => (
              <div key={item.id} className="p-4 border rounded bg-gray-50">
                <p><strong>📅 التاريخ:</strong> {item.date}</p>
                <p><strong>💵 المبلغ المتوقع:</strong> {Number(item.delivered_amount).toFixed(2)} ₪</p>
                <button
                  onClick={() => handleDeliverFromCustody(item.id)}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  تسليم الآن
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
