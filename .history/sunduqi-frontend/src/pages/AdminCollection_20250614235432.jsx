import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ لإرسال الاستلام
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/cash-collection', { date });
      if (res.status === 200) {
        setSuccess(true);
        toast.success('تم استلام الكاش بنجاح');
        loadHistory(); // إعادة تحميل البيانات
      } else {
        toast.error(res.data.message || 'حدث خطأ');
      }
    } catch (err) {
      console.error(err);
      toast.error('فشل الاستلام');
    } finally {
      setLoading(false);
    }
  };

  // ✅ لإظهار الكاش المستلم سابقًا
  const [history, setHistory] = useState([]);
  const [filterBranchId, setFilterBranchId] = useState('');
  const [filterDate, setFilterDate] = useState(today);

  const loadHistory = () => {
    axios
      .get(`/cash-deliveries?is_verified=true&is_collected=true&fromDate=${filterDate}&toDate=${filterDate}${filterBranchId ? `&branch_id=${filterBranchId}` : ''}`)
      .then(res => {
        setHistory(res.data.data || []);
      })
      .catch(err => {
        console.error('⚠️ Error loading history:', err);
      });
  };

  useEffect(() => {
    loadHistory();
  }, [filterDate, filterBranchId]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">🧾 استلام الكاش</h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <label className="block text-gray-600 text-sm">
          📅 التاريخ:
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="block mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'جاري الاستلام...' : 'استلام الكاش'}
        </button>

        {success && <p className="text-green-600 text-sm">✔️ تم الاستلام بنجاح!</p>}
      </div>

      {/* ✅ فلاتر البحث */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mt-10 mb-4">
        <label className="text-sm text-gray-600">
          التاريخ:
          <input
            type="date"
            className="ml-2 border px-2 py-1 rounded-md"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </label>
        <label className="text-sm text-gray-600">
          الفرع:
          <input
            type="number"
            className="ml-2 border px-2 py-1 rounded-md w-28"
            value={filterBranchId}
            onChange={e => setFilterBranchId(e.target.value)}
            placeholder="ID الفرع"
          />
        </label>
      </div>

      <h3 className="text-xl font-bold text-gray-700 mt-4 mb-2">📋 الكاش المستلم سابقًا</h3>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">لا يوجد بيانات لهذا التاريخ.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg border p-4 flex justify-between items-center text-sm"
            >
              <div className="space-y-1">
                <p>👤 {item.user?.full_name || '—'}</p>
                <p>🏢 {item.branch?.name_ar || '—'}</p>
                <p>
                  💰{' '}
                  <span className="font-bold text-green-700">
                    {item.delivered_amount?.toLocaleString()} ₪
                  </span>
                </p>
              </div>
              <span className="text-xs text-green-700 font-bold">تم الاستلام</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
