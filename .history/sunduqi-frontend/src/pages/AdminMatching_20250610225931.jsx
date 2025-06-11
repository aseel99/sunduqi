import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

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
        setMatchings(res.data.data);
      } else if (res.status === 304) {
        // لا تحديث، لا تغيير في البيانات، لا تفعل شيئًا
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
    <div className="p-6 text-right">
      <h1 className="text-2xl font-bold mb-6">مطابقة الكاش</h1>

      <div className="mb-4 flex justify-end items-center gap-2">
        <label className="font-medium">التاريخ:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <button
          onClick={handleShowAll}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded text-sm"
        >
          عرض الكل
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-10">جاري التحميل...</div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2 text-red-600">مطابقات تحتاج مراجعة</h2>
          <MatchingTable matchings={unresolvedMatchings} onResolve={handleResolve} />

          <h2 className="text-lg font-semibold mt-10 mb-2 text-green-700">مطابقات تمت مراجعتها</h2>
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

  const toFixed = (val) => (parseFloat(val) || 0).toFixed(2);

  return (
    <table className="w-full table-auto border border-gray-300 mb-6">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">الفرع</th>
          <th className="border p-2">المستخدم</th>
          <th className="border p-2">التاريخ</th>
          <th className="border p-2">الرصيد المتوقع</th>
          <th className="border p-2">الرصيد الفعلي</th>
          <th className="border p-2">الفرق</th>
          <th className="border p-2">ملاحظات</th>
          <th className="border p-2">الإجراء</th>
        </tr>
      </thead>
      <tbody>
        {matchings.map(m => {
          const expected = parseFloat(m.expected_total) || 0;
          const actual = parseFloat(m.actual_total) || 0;
          const diff = expected - actual;

          return (
            <tr key={m.id}>
              <td className="border p-2">{m.branch_name}</td>
              <td className="border p-2">{m.user_name}</td>
              <td className="border p-2">{m.date}</td>
              <td className="border p-2">{toFixed(expected)}</td>
              <td className="border p-2">{toFixed(actual)}</td>
              <td className={`border p-2 ${diff !== 0 ? 'text-red-600 font-bold' : ''}`}>
                {toFixed(diff)}
              </td>
              <td className="border p-2">{m.notes || '-'}</td>
              <td className="border p-2">
                {!m.is_resolved && onResolve ? (
                  <button
                    onClick={() => onResolve(m.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    تم التدقيق
                  </button>
                ) : (
                  <span className="text-green-600">✔</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
