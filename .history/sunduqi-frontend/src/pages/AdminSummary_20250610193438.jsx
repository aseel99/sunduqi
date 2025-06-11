import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankTransferred, setBankTransferred] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchSummary();
    checkTransferStatus();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/admin/summary');
      setSummary(res.data);
    } catch (err) {
      toast.error('فشل تحميل ملخص المجاميع');
    } finally {
      setLoading(false);
    }
  };

  const checkTransferStatus = async () => {
    try {
      const res = await axios.get(`/bank-transfer/check?branch_id=${user.branch_id}&date=${today}`);
      setBankTransferred(res.data.isTransferred);
    } catch (err) {
      toast.error('فشل التحقق من حالة الترحيل');
    }
  };

  const confirmBankTransfer = async () => {
    if (!window.confirm('هل أنت متأكد من ترحيل المجاميع للبنك؟')) return;
    setSubmitting(true);
    try {
      const totals = summary.reduce(
        (acc, item) => {
          acc.total_receipts += item.total_receipts;
          acc.total_disbursements += item.total_disbursements;
          return acc;
        },
        { total_receipts: 0, total_disbursements: 0 }
      );
      const final_balance = totals.total_receipts - totals.total_disbursements;

      await axios.post('/bank-transfer/confirm', {
        branch_id: user.branch_id,
        date: today,
        ...totals,
        final_balance,
      });

      toast.success('تم الترحيل للبنك بنجاح');
      setBankTransferred(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الترحيل');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">جاري تحميل المجاميع...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">ملخص المجاميع</h2>

        <table className="w-full text-sm border mb-6">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">المقبوضات</th>
              <th className="p-2 border">المصروفات</th>
              <th className="p-2 border">الرصيد النهائي</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.branch_id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.branch_name}</td>
                <td className="p-2 border">{item.total_receipts}</td>
                <td className="p-2 border">{item.total_disbursements}</td>
                <td className="p-2 border font-semibold">
                  {item.total_receipts - item.total_disbursements}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!bankTransferred && (
          <button
            onClick={confirmBankTransfer}
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {submitting ? 'جاري الترحيل...' : 'ترحيل المجاميع للبنك'}
          </button>
        )}

        {bankTransferred && (
          <div className="text-green-700 font-semibold">تم الترحيل للبنك لهذا اليوم ✅</div>
        )}
      </div>
    </div>
  );
}
