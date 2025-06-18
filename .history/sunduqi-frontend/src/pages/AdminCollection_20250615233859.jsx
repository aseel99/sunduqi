import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollectionTabs() {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [collectedGroups, setCollectedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data || []);
    } catch {
      toast.error('فشل تحميل الفروع');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { date };
      if (branchId) params.branch_id = branchId;

      const [pendingRes, collectedRes] = await Promise.all([
        axios.get('/cash-deliveries/pending', { params }),
        axios.get('/cash-collections/grouped', { params }),
      ]);

      setPendingGroups(pendingRes.data || []);
      setCollectedGroups(collectedRes.data || []);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchData();
  }, [date, branchId]);

  const handleCollect = async (group, index) => {
    try {
      await axios.post('/cash-collections', {
        branch_id: group.branch_id,
        collection_date: date,
        total_collected: group.total_delivered,
        notes: `استلام من ${group.user.full_name}`,
        user_id: group.user.id,
      });

      toast.success('تم الاستلام بنجاح');
      fetchData();
    } catch {
      toast.error('فشل في الاستلام');
    }
  };

  return (
    <div className="p-6 font-[Tajawal]" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">استلام الكاش</h2>

      {/* الفلاتر */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm"
        />
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm"
        >
          <option value="">كل الفروع</option>
          {Array.isArray(branches) &&
            branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_ar}
              </option>
            ))}
        </select>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-md ${tab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTab('pending')}
        >
          غير مستلم
        </button>
        <button
          className={`px-4 py-2 rounded-md ${tab === 'collected' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTab('collected')}
        >
          مستلم مسبقًا
        </button>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="grid gap-4">
          {(tab === 'pending' ? pendingGroups : collectedGroups).map((g, idx) => (
            <div
              key={idx}
              className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white shadow"
            >
              <div className="text-sm text-gray-700 space-y-1">
                <p>المستخدم: <span className="font-semibold">{g.user?.full_name}</span></p>
                <p>الفرع: <span className="font-semibold">{g.branch?.name_ar}</span></p>
                <p>المبلغ: <span className="font-bold text-green-700">{Number(g.total_delivered).toFixed(2)} ₪</span></p>
              </div>
              {tab === 'pending' ? (
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm mt-3 sm:mt-0"
                  onClick={() => handleCollect(g, idx)}
                >
                  استلام
                </button>
              ) : (
                <span className="text-green-600 text-sm mt-3 sm:mt-0">✅ تم الاستلام</span>
              )}
            </div>
          ))}
          {(tab === 'pending' ? pendingGroups : collectedGroups).length === 0 && (
            <div className="text-center text-gray-500">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
