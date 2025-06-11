import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function Matching() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [allBranches, setAllBranches] = useState([]);
  const [actualTotals, setActualTotals] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [actualTotal, setActualTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [matchedTotal, setMatchedTotal] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        if (user.role === 'admin') {
          const res = await axios.get('/cash-matching/branch_totals');
          setAllBranches(res.data);
        } else {
          const res = await axios.get(`/cash-matching/matching-summary`, {
            params: {
              user_id: user.id,
              branch_id: user.branch_id,
            },
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            }
          });

          setSummary(res.data);
        }
      } catch {
        setMessage('فشل تحميل البيانات');
      }
    };

    const fetchMatchedTotal = async () => {
      try {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(`/cash-deliveries/matched-total`, {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
            date: today
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 200) {
          setMatchedTotal(res.data.matched_total);
        }
      } catch (error) {
        console.error('فشل في جلب الرصيد المطابق:', error);
      }
    };

    loadSummary();
    if (user.role !== 'admin') fetchMatchedTotal();
  }, [user]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const branch of allBranches) {
        const actual_total = parseFloat(actualTotals[branch.branch_id]);
        const notes = notesMap[branch.branch_id] || '';

        await axios.post('/cash-matching/admin-confirm', {
          user_id: user.id,
          branch_id: branch.branch_id,
          expected_total: branch.expected_total,
          actual_total,
          notes,
          date: branch.date || new Date().toISOString().split('T')[0],
        });
      }
      setMessage('✅ تم حفظ المطابقة بنجاح لجميع الفروع');
    } catch {
      setMessage('❌ حدث خطأ أثناء الحفظ');
    }
  };

  const handleCashierSubmit = async (e) => {
    e.preventDefault();
    if (!actualTotal) return;

    try {
      await axios.post('/cash-matching/confirm', {
        user_id: user.id,
        branch_id: user.branch_id,
        expected_total: summary.expected_total,
        actual_total: parseFloat(actualTotal),
        notes,
        date: new Date().toISOString().split('T')[0],
      });
      setMessage('✅ تم حفظ المطابقة بنجاح');
    } catch {
      setMessage('❌ حدث خطأ أثناء الحفظ');
    }
  };

  const handleMatchedDelivery = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/cash-deliveries/deliver-matched', {
        user_id: user.id,
        branch_id: user.branch_id,
        amount: matchedTotal,
        date: new Date().toISOString().split('T')[0],
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('✅ تم تسليم الرصيد المطابق بنجاح');
    } catch (error) {
      setMessage('❌ فشل في تسليم الرصيد المطابق');
    }
  };

  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-6 text-right">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">مطابقة جميع الفروع</h2>
          {message && <div className="mb-4 text-blue-600 font-bold">{message}</div>}
          <form onSubmit={handleAdminSubmit}>
            <table className="w-full text-sm border mb-6">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">الفرع</th>
                  <th className="p-2 border">الإيرادات</th>
                  <th className="p-2 border">المصروفات</th>
                  <th className="p-2 border">الرصيد الافتتاحي</th>
                  <th className="p-2 border font-bold">الرصيد المتوقع</th>
                  <th className="p-2 border font-bold">الرصيد الفعلي</th>
                  <th className="p-2 border font-bold">الفرق</th>
                  <th className="p-2 border">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {allBranches.map((branch) => {
                  const actual = actualTotals[branch.branch_id] || '';
                  const difference = actual ? (parseFloat(actual) - branch.expected_total).toFixed(2) : '---';
                  return (
                    <tr key={branch.branch_id}>
                      <td className="p-2 border">{branch.branch_name}</td>
                      <td className="p-2 border">{branch.total_receipts} د.أ</td>
                      <td className="p-2 border">{branch.total_disbursements} د.أ</td>
                      <td className="p-2 border">{branch.opening_balance} د.أ</td>
                      <td className="p-2 border font-bold">{branch.expected_total} د.أ</td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          required
                          value={actual}
                          onChange={(e) =>
                            setActualTotals({ ...actualTotals, [branch.branch_id]: e.target.value })
                          }
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2 border text-red-600 font-bold">{difference} د.أ</td>
                      <td className="p-2 border">
                        <textarea
                          rows={2}
                          value={notesMap[branch.branch_id] || ''}
                          onChange={(e) =>
                            setNotesMap({ ...notesMap, [branch.branch_id]: e.target.value })
                          }
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              حفظ المطابقات
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <form onSubmit={handleCashierSubmit}>
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
              onClick={handleMatchedDelivery}
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
