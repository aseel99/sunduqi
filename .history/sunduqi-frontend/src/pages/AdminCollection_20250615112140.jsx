import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const [collections, setCollections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data || []);
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
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setCollections(data);
      console.log('✅ Collections:', data);
    } catch (err) {
      toast.error('فشل تحميل بيانات الاستلام');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [selectedDate, selectedBranchId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">استلام الكاش من الكاشير</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">التاريخ</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">الفرع</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="border rounded px-2 py-1"
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

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">رقم التسليم</th>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">اسم الكاشير</th>
              <th className="p-2 border">المبلغ المسلم</th>
            </tr>
          </thead>
          <tbody>
            {collections.length > 0 ? (
              collections.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 border">{item.delivery_number}</td>
                  <td className="p-2 border">
                    {
                      branches.find((b) => b.id === item.branch_id)?.name_ar ||
                      `فرع ${item.branch_id}`
                    }
                  </td>
                  <td className="p-2 border">
                    {new Date(item.date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-2 border">{`كاشير ${item.user_id}`}</td>
                  <td className="p-2 border text-green-700 font-bold">
                    {parseFloat(item.delivered_amount).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  لا يوجد بيانات لعرضها
                </td>
              </tr>
            )}
          </tbody>
          {collections.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="text-end p-2 font-bold">
                  المجموع الكلي:
                </td>
                <td className="p-2 font-bold text-green-700">
                  {collections
                    .reduce((acc, item) => acc + parseFloat(item.delivered_amount || 0), 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
