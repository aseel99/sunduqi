import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [selectedBranch, fromDate, toDate]);

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
      setLoading(true);
      const params = {
        fromDate,
        toDate,
        ...(selectedBranch && { branch_id: selectedBranch })
      };
      const res = await axios.get('/cash-collections', { params });
      setCollections(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      toast.error('فشل تحميل بيانات الاستلام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-right">سجل الاستلام</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label className="mb-1 text-sm">من تاريخ</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm">إلى تاريخ</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm">الفرع</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">كل الفروع</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-10">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm border">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">رقم الاستلام</th>
                <th className="px-2 py-2">الفرع</th>
                <th className="px-2 py-2">من قام بالاستلام</th>
                <th className="px-2 py-2">التاريخ</th>
                <th className="px-2 py-2">المبلغ</th>
                <th className="px-2 py-2">ملاحظات</th>
                <th className="px-2 py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">لا يوجد بيانات لعرضها</td>
                </tr>
              ) : (
                collections.map((collection, index) => (
                  <tr key={collection.id} className="text-center border-b">
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2">{collection.collection_number}</td>
                    <td className="px-2 py-2">{collection.branch?.name_ar || '-'}</td>
                    <td className="px-2 py-2">{collection.collector?.full_name || '-'}</td>
                    <td className="px-2 py-2">{collection.collection_date?.slice(0, 10)}</td>
                    <td className="px-2 py-2 font-bold">
                      {parseFloat(collection.total_collected || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2">{collection.notes || '-'}</td>
                    <td className="px-2 py-2">
                      {collection.is_verified ? '✔️' : '⏳'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
