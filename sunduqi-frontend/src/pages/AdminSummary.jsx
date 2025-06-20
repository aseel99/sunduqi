import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminSummary() {
  const { user } = useAuth();
  const [branchSummaries, setBranchSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferAmounts, setTransferAmounts] = useState({});
  const [totalTransferAmount, setTotalTransferAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchSummary();
  }, [selectedDate, submitted]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const url = selectedDate ? `/bank-transfer/summary?date=${selectedDate}` : `/bank-transfer/summary`;
      const res = await axios.get(url);
      setBranchSummaries(res.data.data || []);
    } catch (err) {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (branch_id) => {
    const amount = parseFloat(transferAmounts[branch_id]);
    if (!amount || amount <= 0) {
      toast.warning('يرجى إدخال مبلغ صالح');
      return;
    }

    try {
      await axios.post('/bank-transfer/confirm', {
        branch_id,
        date: selectedDate,
        amount,
      });

      toast.success('تم الترحيل بنجاح');
      setSubmitted((prev) => !prev);
      setTransferAmounts({ ...transferAmounts, [branch_id]: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل في الترحيل');
    }
  };

  const handleBulkTransfer = async () => {
    const amount = parseFloat(totalTransferAmount);
    if (!amount || amount <= 0) {
      toast.warning('يرجى إدخال مبلغ صالح');
      return;
    }

    try {
      await axios.post('/bank-transfer/bulk-transfer', {
        date: selectedDate,
        amount,
      });

      toast.success('تم ترحيل المبلغ من المجاميع');
      setSubmitted((prev) => !prev);
      setTotalTransferAmount('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل في ترحيل المجاميع');
    }
  };

  if (loading) return <p className="text-center">جاري التحميل...</p>;

  const totalTransferred = branchSummaries.reduce((acc, branch) => acc + (branch.transferred || 0), 0);
  const totalRemaining = branchSummaries.reduce((acc, branch) => acc + (branch.not_transferred || 0), 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 font-bold">ملخص المجاميع حسب الفروع</h1>

      <div className="mb-4 flex items-center gap-4">
        <label className="font-semibold">التاريخ:</label>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-1 rounded"
        />
        <button
          onClick={() => setSelectedDate(null)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          عرض الكل
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4 overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-right">
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">الوارد</th>
              <th className="p-2 border">الصادر</th>
              <th className="p-2 border">الصافي</th>
              <th className="p-2 border">المرحل</th>
              <th className="p-2 border">المتبقي</th>
              <th className="p-2 border">ترحيل</th>
            </tr>
          </thead>
          <tbody>
            {branchSummaries.map((b) => (
              <tr key={b.branch_id} className="text-right">
                <td className="p-2 border">{b.branch_name}</td>
                <td className="p-2 border">{(b.total_receipts ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{(b.total_disbursements ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{(b.final_balance ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{(b.transferred ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{(b.not_transferred ?? 0).toFixed(2)}</td>
                <td className="p-2 border">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={transferAmounts[b.branch_id] || ''}
                      onChange={(e) =>
                        setTransferAmounts({ ...transferAmounts, [b.branch_id]: e.target.value })
                      }
                      className="border p-1 rounded w-20 text-sm"
                    />
                    <button
                      onClick={() => handleTransfer(b.branch_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                      ترحيل
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold text-right">
              <td className="p-2 border">الإجمالي</td>
              <td className="p-2 border" colSpan="3"></td>
              <td className="p-2 border">{totalTransferred.toFixed(2)}</td>
              <td className="p-2 border">{totalRemaining.toFixed(2)}</td>
              <td className="p-2 border">
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={totalTransferAmount}
                    onChange={(e) => setTotalTransferAmount(e.target.value)}
                    className="border p-1 rounded w-20 text-sm"
                  />
                  <button
                    onClick={handleBulkTransfer}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                  >
                    ترحيل الكل
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
