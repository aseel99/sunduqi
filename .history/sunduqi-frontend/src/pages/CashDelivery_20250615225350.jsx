import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function AdminCollection() {
  const { user } = useAuth();
  const [tab, setTab] = useState('received'); // 'received' or 'unreceived'
  const [deliveries, setDeliveries] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (tab === 'received') {
      fetchReceived();
    } else {
      fetchUnreceived();
    }
  }, [tab, selectedBranch, selectedDate]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data || []);
    } catch {
      toast.error('فشل تحميل الفروع');
    }
  };

  const fetchReceived = async () => {
    try {
      const res = await axios.get('/cash-collections', {
        params: {
          branch_id: selectedBranch || undefined,
          date: selectedDate || undefined
        }
      });
      setDeliveries(res.data.data || []);
    } catch {
      toast.error('فشل تحميل البيانات');
    }
  };

  const fetchUnreceived = async () => {
    try {
      const res = await axios.get('/cash-deliveries/uncollected', {
        params: {
          branch_id: selectedBranch || undefined,
          date: selectedDate || undefined
        }
      });
      setDeliveries(res.data.data || []);
    } catch {
      toast.error('فشل تحميل البيانات');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">إدارة استلام الكاش</h2>

      {/* التبويبات */}
      <div className="flex gap-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${tab === 'received' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTab('received')}
        >
          المستلمة
        </button>
        <button
          className={`py-2 px-4 rounded ${tab === 'unreceived' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTab('unreceived')}
        >
          غير المستلمة
        </button>
      </div>

      {/* الفلاتر */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">اختر الفرع</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">كل الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_ar}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">اختر التاريخ</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">الفرع</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">الملاحظات</th>
              {tab === 'received' && <th className="p-2 border">اسم المستقبل</th>}
              <th className="p-2 border">اسم المسلم</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="p-2 border">{d.branch?.name_ar || '-'}</td>
                <td className="p-2 border">{new Date(d.date).toLocaleDateString('en-GB')}</td>
                <td className="p-2 border text-green-700 font-bold">{Number(d.delivered_amount).toFixed(2)} ₪</td>
                <td className="p-2 border">{d.notes || '-'}</td>
                {tab === 'received' && (
                  <td className="p-2 border text-blue-700">{d.collected_by_user?.full_name || '-'}</td>
                )}
                <td className="p-2 border text-gray-800">{d.user?.full_name || '-'}</td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={tab === 'received' ? 6 : 5} className="text-center text-gray-500 p-4">
                  لا توجد بيانات مطابقة للفلترة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
