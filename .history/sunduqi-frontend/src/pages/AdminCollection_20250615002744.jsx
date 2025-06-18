import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user, selectedDate, selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(Array.isArray(res.data) ? res.data : []);
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

      if (selectedBranchId) {
        params.branchId = selectedBranchId;
      }

      const res = await axios.get('/cash-deliveries', { params });
      const data = Array.isArray(res.data) ? res.data : [];
      setCollections(data);
      console.log('Collections:', data);
    } catch (err) {
      toast.error('فشل تحميل بيانات الاستلام');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">استلام الكاش</h2>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block mb-1">التاريخ:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">الفرع:</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="border px-2 py-1 rounded min-w-[150px]"
          >
            <option value="">كل الفروع</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">رقم السند</th>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">المبلغ المستلم</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">الكاشير</th>
              <th className="p-2 border">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((delivery, index) => (
              <tr key={delivery.id}>
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{delivery.delivery_number}</td>
                <td className="p-2 border">
                  {branches.find((b) => b.id === delivery.branch_id)?.name_ar || '---'}
                </td>
                <td className="p-2 border">{parseFloat(delivery.delivered_amount).toFixed(2)}</td>
                <td className="p-2 border">{new Date(delivery.date).toLocaleDateString('ar-EG')}</td>
                <td className="p-2 border">{delivery.user?.full_name || '---'}</td>
                <td className="p-2 border">{delivery.notes || '---'}</td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  لا توجد بيانات استلام.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
