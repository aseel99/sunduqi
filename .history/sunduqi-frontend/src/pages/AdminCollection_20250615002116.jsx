import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    axios.get('/branches')
      .then(res => setBranches(res.data.rows || res.data || []))
      .catch(() => toast.error('فشل في تحميل الفروع'));
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [selectedDate, selectedBranch]);

  const fetchCollections = async () => {
    try {
      const res = await axios.get('/cash-deliveries', {
        params: {
          is_verified: true,
          is_collected: true,
          fromDate: selectedDate,
          toDate: selectedDate,
          ...(selectedBranch && { branch_id: selectedBranch }),
        },
      });
      setCollections(res.data);
    } catch (err) {
      toast.error('فشل في تحميل الكاش المستلم');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">استلام الكاش</h2>

      {/* الفلاتر */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1">تاريخ</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">الفرع</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="">كل الفروع</option>
            {Array.isArray(branches) && branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* جدول الكاش المستلم */}
      <div className="overflow-auto rounded border border-gray-300">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2">رقم التسليم</th>
              <th className="p-2">الفرع</th>
              <th className="p-2">التاريخ</th>
              <th className="p-2">الموظف</th>
              <th className="p-2">المقبوضات</th>
              <th className="p-2">المصروفات</th>
              <th className="p-2">المبلغ المسلم</th>
              <th className="p-2">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4">لا توجد بيانات</td>
              </tr>
            )}
            {collections.map(delivery => (
              <tr key={delivery.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{delivery.delivery_number}</td>
                <td className="p-2">{branches.find(b => b.id === delivery.branch_id)?.name_ar || ''}</td>
                <td className="p-2">{delivery.date}</td>
                <td className="p-2">{delivery.user?.full_name || '---'}</td>
                <td className="p-2">{delivery.total_receipts?.toFixed(2)}</td>
                <td className="p-2">{delivery.total_disbursements?.toFixed(2)}</td>
                <td className="p-2 font-bold">{delivery.delivered_amount?.toFixed(2)}</td>
                <td className="p-2">{delivery.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
