import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      console.log('✅ Branches response:', res.data);

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setBranches(data);
    } catch (err) {
      toast.error('فشل تحميل الفروع');
    }
  };

  const fetchCollections = async () => {
    try {
      const params = {
        is_verified: true,
        is_collected: true,
        fromDate: selectedDate,
        toDate: selectedDate,
      };
      const res = await axios.get('/cash-deliveries', { params });
      console.log('📦 Deliveries:', res.data);

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setCollections(data);
    } catch (err) {
      toast.error('فشل تحميل الكاش المستلم');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [selectedBranchId, selectedDate]);

  const filteredCollections = selectedBranchId
    ? collections.filter((c) => c.branch_id === parseInt(selectedBranchId))
    : collections;

  return (
    <div className='p-4 space-y-6'>
      <h1 className='text-xl font-bold'>استلام الكاش</h1>

      {/* الفلاتر */}
      <div className='flex flex-col sm:flex-row items-center gap-4'>
        <label className='flex flex-col'>
          التاريخ:
          <input
            type='date'
            className='border p-2 rounded'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>

        <label className='flex flex-col'>
          الفرع:
          <select
            className='border p-2 rounded'
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value=''>كل الفروع</option>
            {Array.isArray(branches) &&
              branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name_ar}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* جدول الكاش المستلم */}
      <div className='overflow-x-auto'>
        <table className='min-w-full border border-gray-300 mt-6'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='border p-2'>الفرع</th>
              <th className='border p-2'>التاريخ</th>
              <th className='border p-2'>رقم التسليم</th>
              <th className='border p-2'>المبلغ المسلم</th>
              <th className='border p-2'>الكاشير</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.length > 0 ? (
              filteredCollections.map((c) => (
                <tr key={c.id}>
                  <td className='border p-2'>
                    {
                      branches.find((b) => b.id === c.branch_id)?.name_ar ??
                      '—'
                    }
                  </td>
                  <td className='border p-2'>{c.date}</td>
                  <td className='border p-2'>{c.delivery_number}</td>
                  <td className='border p-2'>{c.delivered_amount}</td>
                  <td className='border p-2'>{c.user_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className='text-center p-4'>
                  لا يوجد بيانات لعرضها
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
