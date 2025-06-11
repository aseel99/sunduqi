// AdminMatching.jsx
// Displays all branches for admin to enter actual totals and confirm matching.

import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function AdminMatching() {
  const { user } = useAuth();
  const [allBranches, setAllBranches] = useState([]);
  const [actualTotals, setActualTotals] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/cash-matching/branch_totals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBranches(res.data);
      } catch (error) {
        console.error('❌ Failed to load branch totals:', error);
        setMessage('فشل تحميل بيانات الفروع');
      }
    };
    loadSummary();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      for (const branch of allBranches) {
        const actual = parseFloat(actualTotals[branch.branch_id]);
        const note = notesMap[branch.branch_id] || '';
        await axios.post(
          '/cash-matching/admin-confirm',
          {
            user_id: user.id,
            branch_id: branch.branch_id,
            expected_total: branch.expected_total,
            actual_total: actual,
            notes: note,
            date: branch.date || new Date().toISOString().split('T')[0],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMessage('✅ تم حفظ المطابقة بنجاح لجميع الفروع');
    } catch (error) {
      console.error('❌ Error submitting admin match:', error);
      setMessage('❌ حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">مطابقة جميع الفروع</h2>
        {message && <div className="mb-4 text-blue-600 font-bold">{message}</div>}
        <form onSubmit={handleSubmit}>
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
