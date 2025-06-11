import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function AdminVouchers() {
  const [receipts, setReceipts] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filter, setFilter] = useState({ type: '', branch_id: '', amount: '', date: '' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/receipts')
      .then((res) => setReceipts(res.data))
      .catch((err) => console.error('Error fetching receipts:', err));

    axios.get('/disbursements')
      .then((res) => setDisbursements(res.data.data))
      .catch((err) => console.error('Error fetching disbursements:', err));

    axios.get('/branches')
      .then((res) => setBranches(res.data.data || res.data))
      .catch((err) => console.error('Error fetching branches:', err));
  }, []);

  const allVouchers = [
    ...receipts.map(r => ({
      id: r.id,
      type: 'قبض',
      amount: r.amount,
      branch: r.branch?.name_ar,
      branch_id: r.branch?.id,
      date: r.created_at,
    })),
    ...disbursements.map(d => ({
      id: d.id,
      type: 'صرف',
      amount: d.amount,
      branch: d.branch?.name_ar,
      branch_id: d.branch?.id,
      date: d.created_at,
    }))
  ].filter(v => {
    return (
      (!filter.type || v.type === filter.type) &&
      (!filter.branch_id || v.branch_id == filter.branch_id) &&
      (!filter.amount || v.amount == filter.amount) &&
      (!filter.date || v.date?.startsWith(filter.date))
    );
  });

  const resetFilters = () => {
    setFilter({ type: '', branch_id: '', amount: '', date: '' });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right">
      <h2 className="text-2xl font-bold mb-4">السندات</h2>

      <div className="grid grid-cols-5 gap-2 mb-4">
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="p-2 border rounded">
          <option value=''>نوع السند</option>
          <option value='قبض'>قبض</option>
          <option value='صرف'>صرف</option>
        </select>

        <input
          type="date"
          className="p-2 border rounded"
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
        />

        <input
          type="text"
          placeholder="المبلغ"
          className="p-2 border rounded"
          value={filter.amount}
          onChange={(e) => setFilter({ ...filter, amount: e.target.value })}
        />

        <select
          value={filter.branch_id}
          onChange={(e) => setFilter({ ...filter, branch_id: e.target.value })}
          className="p-2 border rounded"
        >
          <option value=''>كل الفروع</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name_ar}
            </option>
          ))}
        </select>

        <button onClick={resetFilters} className="bg-gray-200 rounded p-2 hover:bg-gray-300">
          إعادة تعيين الفلاتر
        </button>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">النوع</th>
              <th className="p-2">الفرع</th>
              <th className="p-2">المبلغ</th>
              <th className="p-2">التاريخ</th>
              <th className="p-2">عرض</th>
            </tr>
          </thead>
          <tbody>
            {allVouchers.map(v => (
              <tr key={v.type + v.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-bold">{v.type}</td>
                <td className="p-2 text-blue-600 cursor-pointer" onClick={() => setFilter({ ...filter, branch_id: v.branch_id })}>
                  {v.branch}
                </td>
                <td className="p-2">{v.amount}</td>
                <td className="p-2">{new Date(v.date).toLocaleDateString()}</td>
                <td className="p-2">
                  <button onClick={() => navigate(`/${v.type === 'صرف' ? 'disbursement' : 'receipt'}/${v.id}`)} className="text-sm text-white bg-blue-500 rounded px-3 py-1">عرض</button>
                </td>
              </tr>
            ))}
            {allVouchers.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">لا يوجد نتائج</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
