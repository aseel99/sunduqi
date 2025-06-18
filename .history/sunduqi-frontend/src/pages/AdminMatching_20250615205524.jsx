import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

const toFixed = (num) => (parseFloat(num) || 0).toFixed(2);

export default function AdminMatching() {
  const { user } = useAuth();
  const [matchings, setMatchings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState('unresolved');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchings();
  }, [selectedDate]);

  const fetchMatchings = async () => {
    try {
      setLoading(true);
      const url = `/cash-matching?date=${selectedDate}`;
      const res = await axios.get(url);
      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setMatchings(res.data.data);
      } else {
        setMatchings([]);
      }
    } catch (err) {
      toast.error('فشل في تحميل بيانات المطابقة');
      setMatchings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(`/cash-matching/${id}/resolve`);
      toast.success('تمت مراجعة المطابقة');
      fetchMatchings();
    } catch {
      toast.error('فشل في مراجعة المطابقة');
    }
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const filteredMatchings = matchings.filter(m => m.user?.role === 'casher');
  const unresolved = filteredMatchings.filter(m => !m.is_resolved && (m.date === selectedDate || m.date === yesterdayStr));
  const resolved = filteredMatchings.filter(m => m.is_resolved);

  const displayedMatchings = activeTab === 'unresolved' ? unresolved : resolved;

  return (
    <div className="p-6 text-right font-[Tajawal]" dir="rtl">
      <h1 className="text-2xl font-bold text-yellow-600 mb-4">مطابقة الكاش</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">تاريخ:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-4 py-2 text-sm"
        />
      </div>

      <div className="mb-4 border-b">
        <button
          className={`px-4 py-2 rounded-t-md font-semibold text-sm ${activeTab === 'unresolved' ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('unresolved')}
        >
          غير المراجعة (اليوم وأمس)
        </button>
        <button
          className={`px-4 py-2 rounded-t-md font-semibold text-sm ml-2 ${activeTab === 'resolved' ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('resolved')}
        >
          المطابقات المعتمدة
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">جاري التحميل...</div>
      ) : (
        <MatchingTable matchings={displayedMatchings} onResolve={activeTab === 'unresolved' ? handleResolve : null} />
      )}
    </div>
  );
}

function MatchingTable({ matchings, onResolve }) {
  if (!Array.isArray(matchings) || matchings.length === 0) {
    return <div className="text-center text-gray-500 py-6">لا توجد مطابقات</div>;
  }

  return (
    <div className="overflow-x-auto border rounded shadow-sm">
      <table className="min-w-full text-sm text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">الفرع</th>
            <th className="p-2 border">المستخدم</th>
            <th className="p-2 border">التاريخ</th>
            <th className="p-2 border">الرصيد المتوقع</th>
            <th className="p-2 border">الرصيد الفعلي</th>
            <th className="p-2 border">الفرق</th>
            <th className="p-2 border">ملاحظات</th>
            <th className="p-2 border">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {matchings.map((m) => {
            const diff = (parseFloat(m.expected_total) || 0) - (parseFloat(m.actual_total) || 0);
            return (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-2 border">{m.branch?.name_ar || '-'}</td>
                <td className="p-2 border">{m.user?.full_name || '-'}</td>
                <td className="p-2 border">{m.date}</td>
                <td className="p-2 border">{toFixed(m.expected_total)} شيكل</td>
                <td className="p-2 border">{toFixed(m.actual_total)} شيكل</td>
                <td className={`p-2 border font-bold ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>{toFixed(diff)} شيكل</td>
                <td className="p-2 border">{m.notes || '-'}</td>
                <td className="p-2 border text-center">
                  {!m.is_resolved && onResolve ? (
                    <button
                      onClick={() => onResolve(m.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    >
                      تدقيق
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
    </div>
  );
}
