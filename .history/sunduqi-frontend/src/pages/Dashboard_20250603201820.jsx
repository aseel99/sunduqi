import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = user.role === 'admin'
          ? '/admin/dashboard-stats'
          : `/dashboard-stats?branch_id=${user.branch_id}`;

        const res = await axios.get(endpoint);
        setStats(res.data);
      } catch (err) {
        toast.error('فشل تحميل بيانات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="text-center mt-10">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">لوحة التحكم</h2>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المقبوضات"
            value={stats?.total_receipts || 0}
            icon="💰"
            color="green"
          />
          <StatCard
            title="إجمالي المصروفات"
            value={stats?.total_disbursements || 0}
            icon="💸"
            color="red"
          />
          <StatCard
            title="الرصيد الحالي"
            value={stats?.current_balance || 0}
            icon="🏦"
            color="blue"
          />
          {user.role === 'admin' && (
            <StatCard
              title="عدد الفروع"
              value={stats?.branches_count || 0}
              icon="🏢"
              color="purple"
            />
          )}
        </div>

        {/* Latest Vouchers */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">أحدث السندات</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">رقم السند</th>
                    <th className="p-2 border">النوع</th>
                    <th className="p-2 border">الفرع</th>
                    <th className="p-2 border">المبلغ</th>
                    <th className="p-2 border">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_vouchers?.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{v.receipt_number || v.disbursement_number}</td>
                      <td className="p-2 border">
                        {v.type === 'receipt' ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            قبض
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            صرف
                          </span>
                        )}
                      </td>
                      <td className="p-2 border">{v.branch_name}</td>
                      <td className="p-2 border">{v.amount} شيكل</td>
                      <td className="p-2 border">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {stats?.recent_vouchers?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 p-4">
                        لا توجد سندات حديثة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">الإشعارات الحديثة</h3>
          <div className="space-y-3">
            {stats?.recent_notifications?.map((n) => (
              <div
                key={n.id}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {stats?.recent_notifications?.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                لا توجد إشعارات حديثة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const isCurrency = !title.includes('عدد');

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="text-2xl font-bold mt-1">
            {value} {isCurrency && 'شيكل'}
          </div>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
