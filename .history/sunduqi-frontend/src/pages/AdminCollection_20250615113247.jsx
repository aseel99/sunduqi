import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [collections, setCollections] = useState({ data: [] });
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الفروع
  useEffect(() => {
    axios.get('/branches').then((res) => {
      if (Array.isArray(res.data)) {
        setBranches(res.data);
      }
    });
  }, []);

  // تحميل الاستلامات
  useEffect(() => {
    fetchCollections();
  }, [selectedBranchId, selectedDate]);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const query = [];
      if (selectedBranchId) query.push(`branchId=${selectedBranchId}`);
      if (selectedDate) query.push(`date=${selectedDate}`);
      const res = await axios.get(`/api/cash-collections?${query.join('&')}`);
      console.log('✅ collections:', res.data);
      setCollections(res.data);
    } catch (err) {
      toast.error('فشل تحميل بيانات الاستلام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4 space-y-4'>
      {/* ✅ قسم الاستلام يبقى في الأعلى */}
      <h2 className='text-xl font-bold'>استلام الكاش</h2>

      {/* فلاتر */}
      <div className='flex flex-wrap items-center gap-4'>
        <label className='flex items-center gap-2'>
          الفرع:
          <select
            className='border rounded p-1'
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value=''>كل الفروع</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name_ar}
              </option>
            ))}
          </select>
        </label>

        <label className='flex items-center gap-2'>
          التاريخ:
          <input
            type='date'
            className='border rounded p-1'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {/* ✅ جدول الاستلامات */}
      <div>
        <h3 className='text-lg font-semibold mt-4'>الاستلامات السابقة</h3>
        {isLoading ? (
          <p>جارٍ التحميل...</p>
        ) : collections?.data?.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full border mt-2 text-sm text-center'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='border p-2'>#</th>
                  <th className='border p-2'>رقم الاستلام</th>
                  <th className='border p-2'>الفرع</th>
                  <th className='border p-2'>الكاشير</th>
                  <th className='border p-2'>المبلغ المستلم</th>
                  <th className='border p-2'>الوقت</th>
                </tr>
              </thead>
              <tbody>
                {collections.data.map((item, index) => (
                  <tr key={item.id}>
                    <td className='border p-2'>{index + 1}</td>
                    <td className='border p-2'>{item.collection_number}</td>
                    <td className='border p-2'>{item.branch?.name_ar || '—'}</td>
                    <td className='border p-2'>{item.user?.full_name || '—'}</td>
                    <td className='border p-2'>{parseFloat(item.total_collected || 0).toFixed(2)}</td>
                    <td className='border p-2'>{new Date(item.created_at).toLocaleTimeString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-gray-500 mt-2'>لا يوجد بيانات لعرضها</p>
        )}
      </div>
    </div>
  );
}
