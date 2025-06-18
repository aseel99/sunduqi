import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const [branches, setBranches] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [selectedBranchId, selectedDate]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      toast.error('فشل في تحميل الفروع');
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await axios.get('/cash-collections', {
        params: {
          branch_id: selectedBranchId || undefined,
          date: selectedDate,
        },
      });
      setCollections(res.data.data || []);
      console.log('✅ collections fetched:', res.data.data);
    } catch (err) {
      toast.error('فشل في تحميل بيانات الاستلام');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-right">استلام الكاش</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex flex-col">
          <label className="text-sm mb-1">تاريخ الاستلام</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">الفرع</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="border px-2 py-1 rounded w-48"
          >
            <option value="">الكل</option>
            {Array.isArray(branches) &&
              branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name_ar}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-right bg-white shadow-md rounded">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">رقم التسليم</th>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">المستخدم</th>
              <th className="p-2 border">المبلغ المستلم</th>
              <th className="p-2 border">تاريخ الاستلام</th>
              <th className="p-2 border">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {collections.length > 0 ? (
              collections.map((collection) => (
                <tr key={collection.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{collection.delivery_number}</td>
                  <td className="p-2 border">{collection.branch?.name_ar || '—'}</td>
                  <td className="p-2 border">{collection.collector?.full_name || '—'}</td>
                  <td className="p-2 border">{collection.delivered_amount}</td>
                  <td className="p-2 border">{new Date(collection.collection_date).toLocaleDateString()}</td>
                  <td className="p-2 border">{collection.notes || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
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
