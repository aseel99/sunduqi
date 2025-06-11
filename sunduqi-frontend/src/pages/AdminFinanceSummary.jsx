import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function AdminFinanceSummary() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/branches?limit=1000').then(res => setBranches(res.data.data || []));
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedBranch) params.branch_id = selectedBranch;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    setLoading(true);
    axios.get('/branches/branch-totals', { params })
      .then(res => setData(res.data || []))
      .catch(err => console.error('Error loading data', err))
      .finally(() => setLoading(false));
  }, [selectedBranch, fromDate, toDate]);

  const totalReceipts = data.reduce((sum, b) => sum + Number(b.total_receipts || 0), 0);
  const totalDisbursements = data.reduce((sum, b) => sum + Number(b.total_disbursements || 0), 0);

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-yellow-100">
        {/* عنوان */}
        <h1 className="text-2xl font-bold text-yellow-600 mb-6">ملخص العمليات المالية</h1>

        {/* الفلاتر */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              className="w-full border rounded-md px-4 py-2 shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="w-full border rounded-md px-4 py-2 shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">الفرع</label>
            <select
              className="w-full border rounded-md px-4 py-2 shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
            >
              <option value="">جميع الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
          </div>
        </div>

        {/* تحميل */}
        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : (
          <>
            {/* جدول البيانات */}
            <div className="overflow-x-auto border rounded-md shadow-sm">
              <table className="min-w-full text-sm text-gray-700 text-right">
                <thead className="bg-gray-100 font-bold border-b">
                  <tr>
                    <th className="p-3 border-l">الفرع</th>
                    <th className="p-3 border-l">المقبوضات</th>
                    <th className="p-3">المصروفات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(row => (
                    <tr key={row.branch_id} className="hover:bg-gray-50 border-t">
                      <td className="p-2">{row.branch_name}</td>
                      <td className="p-2 text-green-600 font-medium">{Number(row.total_receipts).toFixed(2)}</td>
                      <td className="p-2 text-red-500 font-medium">{Number(row.total_disbursements).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* المجموع */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 text-green-700 border border-green-100 rounded-md p-4">
                💰 مجموع المقبوضات: <span className="font-bold">{totalReceipts.toFixed(2)} شيكل</span>
              </div>
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-md p-4">
                💸 مجموع المصروفات: <span className="font-bold">{totalDisbursements.toFixed(2)} شيكل</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
