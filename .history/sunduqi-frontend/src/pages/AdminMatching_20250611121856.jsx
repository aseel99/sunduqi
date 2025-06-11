import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

const toFixed = (num) => (parseFloat(num) || 0).toFixed(2);

export default function AdminMatching() {
  const { user } = useAuth();
  const [matchings, setMatchings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchings();
  }, [selectedDate]);

  const fetchMatchings = async () => {
    try {
      setLoading(true);
      const url = selectedDate ? `/cash-matching?date=${selectedDate}` : `/cash-matching`;
      const res = await axios.get(url, { validateStatus: () => true });

      if (res.status === 200 && Array.isArray(res.data?.data)) {
        const cashierOnly = res.data.data.filter(m => m.user && m.user.role === 'casher');
        setMatchings(cashierOnly);
      } else {
        setMatchings([]);
      }
    } catch (err) {
      toast.error('فشل في تحميل المطابقات');
      setMatchings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(`/cash-matching/${id}/resolve`);
      toast.success('تمت مراجعة المطابقة بنجاح');
      fetchMatchings();
    } catch (err) {
      toast.error('حدث خطأ أثناء مراجعة المطابقة');
    }
  };

  const handleShowAll = () => {
    setSelectedDate('');
  };

  const unresolvedMatchings = matchings.filter(m => !m.is_resolved);
  const resolvedTodayMatchings = matchings.filter(
    m => m.is_resolved && m.resolved_at?.slice(0, 10) === selectedDate
  );

  return (
    <div className="p-6 text-right font-[Tajawal]" dir="rtl">
      <h1 className="text-2xl font-bold text-yellow-600 mb-6">مطابقة الكاش</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">التاريخ:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border rounded-md px-4 py-2 text-sm shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
        />
        <button
          onClick={handleShowAll}
          className="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded-md border"
        >
          عرض الكل
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-10 text-gray-500">جاري التحميل...</div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2 text-red-600">مطابقات تحتاج مراجعة</h2>
          <MatchingTable matchings={unresolvedMatchings} onResolve={handleResolve} />

          <h2 className="text-lg font-semibold mt-10 mb-2 text-green-600">مطابقات تمت مراجعتها</h2>
          <MatchingTable matchings={resolvedTodayMatchings} />
        </>
      )}
    </div>
  );
}

function MatchingTable({ matchings, onResolve }) {
  if (!Array.isArray(matchings) || matchings.length === 0) {
    return <div className="text-center text-gray-500 py-6">لا توجد مطابقات</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm mb-6">
      <table className="min-w-full table-auto text-sm text-right text-gray-800">
        <thead className="bg-gray-100 font-bold">
          <tr>
            <th className="border p-3">الفرع</th>
            <th className="border p-3">المستخدم</th>
            <th className="border p-3">التاريخ</th>
            <th className="border p-3">الرصيد المتوقع</th>
            <th className="border p-3">الرصيد الفعلي</th>
            <th className="border p-3">الفرق</th>
            <th className="border p-3">ملاحظات</th>
            <th className="border p-3">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {matchings.map(m => {
            const diff = (parseFloat(m.expected_total) || 0) - (parseFloat(m.actual_total) || 0);
            return (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="border p-2">{m.branch?.name_ar || '-'}</td>
                <td className="border p-2">{m.user?.full_name || '-'}</td>
                <td className="border p-2">{m.date}</td>
                <td className="border p-2">{toFixed(m.expected_total)} ₪</td>
                <td className="border p-2">{toFixed(m.actual_total)} ₪</td>
                <td className={`border p-2 font-bold ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {toFixed(diff)} ₪
                </td>
                <td className="border p-2">{m.notes || '-'}</td>
                <td className="border p-2 text-center">
                  {!m.is_resolved && onResolve ? (
                    <button
                      onClick={() => onResolve(m.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-md"
                    >
                      تم التدقيق
                    </button>
                  ) : (
                    <span className="text-green-600 text-lg">✔</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
