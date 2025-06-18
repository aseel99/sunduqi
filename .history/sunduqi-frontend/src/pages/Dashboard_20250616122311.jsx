import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalVouchers: 0,
    totalCash: 0,
    totalExpenses: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4 md:p-8 font-[Tajawal] text-right" dir="rtl">
      {/* Card Container */}
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="bg-[#33475b] text-white text-xl font-semibold px-6 py-4 flex justify-between items-center">
          <span>📊 إحصائيات</span>
          <span>{user?.full_name}</span>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="bg-gray-100 border border-gray-300 rounded-md p-4 flex justify-between items-center">
            <span className="text-gray-600">عدد السندات</span>
            <span className="font-bold text-lg text-[#33475b]">{stats.totalVouchers}</span>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-md p-4 flex justify-between items-center">
            <span className="text-gray-600">إجمالي المقبوض</span>
            <span className="font-bold text-lg text-green-600">{stats.totalCash} ₪</span>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-md p-4 flex justify-between items-center">
            <span className="text-gray-600">إجمالي المصروف</span>
            <span className="font-bold text-lg text-red-600">{stats.totalExpenses} ₪</span>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-md p-4 flex justify-between items-center">
            <span className="text-gray-600">عدد المستخدمين</span>
            <span className="font-bold text-lg text-[#33475b]">{stats.totalUsers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
