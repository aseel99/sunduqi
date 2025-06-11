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
      .then(res => setReceipts(res.data))
      .catch(err => console.error('Error fetching receipts:', err));

    axios.get('/disbursements')
      .then(res => setDisbursements(res.data.data))
      .catch(err => console.error('Error fetching disbursements:', err));

    axios.get('/branches')
      .then(res => setBranches(res.data.data || res.data))
      .catch(err => console.error('Error fetching branches:', err));
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
    <div className="min-h-screen p-6 bg-gray-100 text-right font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6">السندات</h2>

      {/* الفلاتر */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="p-2 border rounded-md text-sm"
        >
          <option value=''>نوع السند</option>
          <option value='قبض'>قبض</option>
          <option value='صرف'>صرف</option>
        </select>

        <input
          type="date"
          className="p-2 border rounded-md text-sm"
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
        />

        <input
          type="text"
          placeholder="المبلغ"
          className="p-2 border rounded-md text-sm"
          value={filter.amount}
          onChange={(e) => setFilter({ ...filter, amount: e.target.value })}
        />

        <select
          value={filter.branch_id}
          onChange={(e) => setFilter({ ...filter, branch_id: e.target.value })}
          className="p-2 border rounded-md text-sm"
        >
          <option value=''>كل الفروع</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name_ar}</option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 rounded-md p-2 text-sm"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 border">النوع</th>
              <th className="p-3 border">الفرع</th>
              <th className="p-3 border">المبلغ</th>
              <th className="p-3 border">التاريخ</th>
              <th className="p-3 border">عرض</th>
            </tr>
          </thead>
          <tbody>
            {allVouchers.length > 0 ? (
              allVouchers.map(v => (
                <tr key={v.type + v.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-bold">{v.type}</td>
                  <td
                    className="p-2 text-blue-600 hover:underline cursor-pointer"
                    onClick={() => setFilter({ ...filter, branch_id: v.branch_id })}
                  >
                    {v.branch}
                  </td>
                  <td className="p-2 text-green-700 font-semibold">{Number(v.amount).toFixed(2)} ₪</td>
                  <td className="p-2">{new Date(v.date).toLocaleDateString('en-EG')}</td>
                  <td className="p-2">
                    <button
                      onClick={() => navigate(`/${v.type === 'صرف' ? 'disbursement' : 'receipt'}/${v.id}`)}
                      className="text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-1 rounded-md text-sm"
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">لا يوجد نتائج</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
