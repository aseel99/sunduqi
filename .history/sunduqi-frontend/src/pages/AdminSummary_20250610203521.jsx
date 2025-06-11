import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminSummary() {
  const { user } = useAuth();
  const [branchSummaries, setBranchSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferAmounts, setTransferAmounts] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [submitted]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/bank-transfer/summary');
      setBranchSummaries(res.data);
    } catch (err) {
      toast.error('فشل تحميل بيانات الفروع');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferChange = (branchId, value) => {
    setTransferAmounts(prev => ({ ...prev, [branchId]: value }));
  };

  const handleConfirmTransfer = async (branchId, date) => {
    const payload = {
      branch_id: branchId,
      date,
      amount: transferAmounts[branchId],
    };

    try {
      await axios.post('/bank-transfer/confirm', payload);
      toast.success('تم الترحيل بنجاح');
      setSubmitted(!submitted);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في الترحيل');
    }
  };

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>;

  return (
    <div className="p-6 text-right">
      <h1 className="text-2xl font-bold mb-6">مجاميع الفروع وترحيل البنك</h1>
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">الفرع</th>
            <th className="border p-2">التاريخ</th>
            <th className="border p-2">المقبوضات</th>
            <th className="border p-2">المصروفات</th>
            <th className="border p-2">الصافي</th>
            <th className="border p-2">المرحل</th>
            <th className="border p-2">المتبقي</th>
            <th className="border p-2">مبلغ للترحيل</th>
            <th className="border p-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {branchSummaries.map(row => {
            const remaining = row.total_balance - row.total_transferred;
            return (
              <tr key={`${row.branch_id}-${row.date}`}>
                <td className="border p-2">{row.branch_name}</td>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">{row.total_receipts.toFixed(2)}</td>
                <td className="border p-2">{row.total_disbursements.toFixed(2)}</td>
                <td className="border p-2">{row.total_balance.toFixed(2)}</td>
                <td className="border p-2">{row.total_transferred.toFixed(2)}</td>
                <td className="border p-2 text-red-600 font-bold">{remaining.toFixed(2)}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={transferAmounts[row.branch_id] || ''}
                    onChange={e => handleTransferChange(row.branch_id, e.target.value)}
                    className="border p-1 w-24 text-center"
                    min="0"
                    max={remaining}
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleConfirmTransfer(row.branch_id, row.date)}
                    disabled={!transferAmounts[row.branch_id] || transferAmounts[row.branch_id] <= 0 || transferAmounts[row.branch_id] > remaining}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded disabled:opacity-50"
                  >
                    ترحيل
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
