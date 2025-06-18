import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollectionTabs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [todayGroups, setTodayGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [filters, setFilters] = useState({ date: '', branch_id: '' });
  const [branches, setBranches] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchBranches();
    fetchTodayGroups();
    fetchPendingGroups();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data);
    } catch (err) {
      toast.error('فشل تحميل الفروع');
    }
  };

  const fetchTodayGroups = async () => {
    try {
      const res = await axios.get(`/cash-collections/grouped`, {
        params: { date: filters.date || today, branch_id: filters.branch_id }
      });
      setTodayGroups(res.data);
    } catch (err) {
      toast.error('فشل تحميل الاستلامات اليومية');
    }
  };

  const fetchPendingGroups = async () => {
    try {
      const res = await axios.get(`/cash-deliveries/pending`);
      setPendingGroups(res.data);
    } catch (err) {
      toast.error('فشل تحميل السندات المتأخرة');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 font-[Tajawal] text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6">إدارة الاستلامات</h2>

      {/* Tabs */}
      <div className="mb-4 flex gap-4">
        <button onClick={() => setActiveTab('today')} className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'today' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          استلام اليوم
        </button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          السندات المتأخرة
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="border px-4 py-2 rounded-md text-sm"
        />
        <select
          name="branch_id"
          value={filters.branch_id}
          onChange={handleFilterChange}
          className="border px-4 py-2 rounded-md text-sm"
        >
          <option value="">كل الفروع</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name_ar}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (activeTab === 'today') fetchTodayGroups();
            else fetchPendingGroups();
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm"
        >
          تطبيق الفلاتر
        </button>
      </div>

      {/* Tab Content */}
      {(activeTab === 'today' ? todayGroups : pendingGroups).map((g, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow p-4 mb-4">
          <p><strong>المستخدم:</strong> {g.user?.full_name}</p>
          <p><strong>الفرع:</strong> {g.branch?.name_ar}</p>
          <p><strong>المبلغ:</strong> <span className="text-green-700 font-bold">{g.total_delivered?.toLocaleString()} ₪</span></p>
        </div>
      ))}

      {(activeTab === 'today' ? todayGroups : pendingGroups).length === 0 && (
        <div className="text-center text-gray-500 mt-6">لا توجد بيانات لعرضها</div>
      )}
    </div>
  );
}
