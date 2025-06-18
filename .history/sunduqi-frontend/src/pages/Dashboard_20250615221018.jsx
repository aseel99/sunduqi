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
        const endpoint =
          user.role === 'admin'
            ? '/admin/dashboard-stats'
            : '/admin/dashboard-stats/casher';

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
    return <div className="text-center mt-10 font-[Tajawal]">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-600 mb-6">لوحة التحكم</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المقبوضات"
            value={stats?.totalReceipts || 0}
            icon="💰"
            color="green"
          />
          <StatCard
            title="إجمالي المصروفات"
            value={stats?.totalDisbursements || 0}
            icon="💸"
            color="red"
          />
          <StatCard
            title="إجمالي التسليمات"
            value={stats?.totalDeliveries || 0}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="إجمالي المستلمات"
            value={stats?.totalCollections || 0}
            icon="📥"
            color="purple"
          />
        </div>

        {user.role === 'admin' && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">أحدث السندات</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3 border">رقم السند</th>
                      <th className="p-3 border">النوع</th>
                      <th className="p-3 border">الفرع</th>
                      <th className="p-3 border">المبلغ</th>
                      <th className="p-3 border">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent_vouchers?.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 border-t">
                        <td className="p-2 border">{v.receipt_number || v.disbursement_number}</td>
                        <td className="p-2 border">
                          {v.type === 'receipt' ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                              قبض
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                              صرف
                            </span>
                          )}
                        </td>
                        <td className="p-2 border">{v.branch_name}</td>
                        <td className="p-2 border text-green-700 font-medium">
                          {Number(v.amount).toFixed(2)} ₪
                        </td>
                        <td className="p-2 border">
                          {new Date(v.created_at).toLocaleDateString('en-GB')}
                        </td>
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
          </>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">الإشعارات الحديثة</h3>
          <div className="space-y-3">
            {stats?.recent_notifications?.map((n) => (
              <div key={n.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium text-gray-800">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString('en-GB')}
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
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-1 text-gray-800">
            {value} {isCurrency && '₪'}
          </div>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
