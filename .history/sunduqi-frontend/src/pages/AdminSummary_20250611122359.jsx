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
      amount: parseFloat(transferAmounts[branchId]),
    };

    try {
      await axios.post('/bank-transfer/confirm', payload);
      toast.success('تم الترحيل بنجاح');
      setSubmitted(!submitted);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في الترحيل');
    }
  };

  const handleShowAll = () => {
    setSelectedDate('');
  };

  const calculateTotals = () => {
    let totalReceipts = 0;
    let totalDisbursements = 0;
    let totalTransferred = 0;

    branchSummaries.forEach(row => {
      totalReceipts += parseFloat(row.total_receipts) || 0;
      totalDisbursements += parseFloat(row.total_disbursements) || 0;
      totalTransferred += parseFloat(row.transferred) || 0;
    });

    const totalBalance = totalReceipts - totalDisbursements;
    const totalRemaining = totalBalance - totalTransferred;

    return {
      totalReceipts,
      totalDisbursements,
      totalBalance,
      totalTransferred,
      totalRemaining
    };
  };

  const {
    totalReceipts,
    totalDisbursements,
    totalBalance,
    totalTransferred,
    totalRemaining
  } = calculateTotals();

  return (
    <div className="p-6 text-right font-[Tajawal]" dir="rtl">
      <h1 className="text-2xl font-bold text-yellow-600 mb-6">مجاميع الفروع وترحيل البنك</h1>

      {/* التاريخ + زر عرض الكل */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
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
        <div className="text-center text-gray-500 mt-10">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full table-auto text-sm text-right text-gray-800">
            <thead className="bg-gray-100 font-bold">
              <tr>
                <th className="p-3 border">الفرع</th>
                <th className="p-3 border">التاريخ</th>
                <th className="p-3 border">المقبوضات</th>
                <th className="p-3 border">المصروفات</th>
                <th className="p-3 border">الصافي</th>
                <th className="p-3 border">المرحل</th>
                <th className="p-3 border">المتبقي</th>
                <th className="p-3 border">مبلغ للترحيل</th>
                <th className="p-3 border">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {branchSummaries.length > 0 ? (
                branchSummaries.map(row => {
                  const receipts = parseFloat(row.total_receipts) || 0;
                  const disbursements = parseFloat(row.total_disbursements) || 0;
                  const transferred = parseFloat(row.transferred) || 0;
                  const balance = receipts - disbursements;
                  const remaining = balance - transferred;
                  const date = row.date || 'غير محدد';

                  return (
                    <tr key={`${row.branch_id}-${date}`} className="hover:bg-gray-50 border-t">
                      <td className="p-2 border">{row.branch_name}</td>
                      <td className="p-2 border">{date}</td>
                      <td className="p-2 border">{receipts.toFixed(2)} شيكل</td>
                      <td className="p-2 border">{disbursements.toFixed(2)} شيكل</td>
                      <td className="p-2 border">{balance.toFixed(2)} شيكل</td>
                      <td className="p-2 border">{transferred.toFixed(2)} شيكل</td>
                      <td className="p-2 border text-red-600 font-semibold">{remaining.toFixed(2)} شيكل</td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={transferAmounts[row.branch_id] || ''}
                          onChange={e => handleTransferChange(row.branch_id, e.target.value)}
                          className="border p-1 w-24 text-center rounded-md"
                          min="0"
                          max={remaining}
                        />
                      </td>
                      <td className="p-2 border">
                        <button
                          onClick={() => handleConfirmTransfer(row.branch_id, date)}
                          disabled={
                            !transferAmounts[row.branch_id] ||
                            parseFloat(transferAmounts[row.branch_id]) <= 0 ||
                            parseFloat(transferAmounts[row.branch_id]) > remaining ||
                            date === 'غير محدد'
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded disabled:opacity-50"
                        >
                          ترحيل
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-gray-500 p-6">لا توجد بيانات متاحة</td>
                </tr>
              )}
            </tbody>

            {/* المجاميع */}
            <tfoot>
              <tr className="bg-yellow-50 font-bold text-sm">
                <td className="p-2 border text-center" colSpan={2}>المجموع</td>
                <td className="p-2 border">{totalReceipts.toFixed(2)} شيكل</td>
                <td className="p-2 border">{totalDisbursements.toFixed(2)} شيكل</td>
                <td className="p-2 border">{totalBalance.toFixed(2)} شيكل</td>
                <td className="p-2 border">{totalTransferred.toFixed(2)} شيكل</td>
                <td className="p-2 border text-red-600">{totalRemaining.toFixed(2)} شيكل</td>
                <td className="p-2 border" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
