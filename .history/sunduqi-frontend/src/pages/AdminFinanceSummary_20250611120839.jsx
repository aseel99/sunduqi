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
    <div className="min-h-screen p-6 bg-gray-100 text-right">
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">ملخص العمليات المالية</h1>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">من تاريخ</label>
            <input type="date" className="border p-2 rounded w-full" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">إلى تاريخ</label>
            <input type="date" className="border p-2 rounded w-full" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">الفرع</label>
            <select className="border p-2 rounded w-full" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
              <option value="">جميع الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <p>جاري التحميل...</p> : (
          <>
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">الفرع</th>
                  <th className="border p-2">المقبوضات</th>
                  <th className="border p-2">المصروفات</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.branch_id}>
                    <td className="border p-2">{row.branch_name}</td>
                    <td className="border p-2">{Number(row.total_receipts).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.total_disbursements).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 border rounded bg-gray-50">
              <p>💰 مجموع المقبوضات: {totalReceipts.toFixed(2)}</p>
              <p>💸 مجموع المصروفات: {totalDisbursements.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
