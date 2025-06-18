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
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-6 font-[Tajawal]" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Bar */}
        <div className="bg-[#2e3e50] text-white rounded shadow px-6 py-3 text-lg font-bold">
          📊 الإحصائيات
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox label="إجمالي المقبوضات" value={stats?.total_receipts} bg="bg-green-600" />
          <StatBox label="إجمالي المصروفات" value={stats?.total_disbursements} bg="bg-red-600" />
          <StatBox label="الرصيد الحالي" value={stats?.current_balance} bg="bg-blue-600" />
          {user.role === 'admin' && (
            <StatBox label="عدد الفروع" value={stats?.branches_count} bg="bg-purple-600" noCurrency />
          )}
        </div>

        {/* Latest Vouchers Table */}
        {stats?.recent_vouchers?.length > 0 && (
          <div className="bg-white rounded shadow overflow-x-auto">
            <div className="bg-[#2e3e50] text-white text-md font-semibold px-4 py-2">
              🧾 أحدث السندات
            </div>
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-100 text-gray-800 font-semibold">
                <tr>
                  <th className="border px-3 py-2">رقم السند</th>
                  <th className="border px-3 py-2">النوع</th>
                  <th className="border px-3 py-2">الفرع</th>
                  <th className="border px-3 py-2">المبلغ</th>
                  <th className="border px-3 py-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_vouchers.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-gray-50">
                    <td className="border px-3 py-2">
                      {v.receipt_number || v.disbursement_number}
                    </td>
                    <td className="border px-3 py-2">
                      {v.type === 'receipt' ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          قبض
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                          صرف
                        </span>
                      )}
                    </td>
                    <td className="border px-3 py-2">{v.branch_name}</td>
                    <td className="border px-3 py-2 font-bold text-green-800">
                      {Number(v.amount).toFixed(2)} ₪
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(v.created_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded shadow">
          <div className="bg-[#2e3e50] text-white px-4 py-2 font-semibold text-md">
            🔔 الإشعارات الحديثة
          </div>
          <div className="p-4 space-y-3">
            {stats?.recent_notifications?.map((n) => (
              <div
                key={n.id}
                className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="font-medium text-gray-800">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString('en-GB')}
                </div>
              </div>
            ))}
            {stats?.recent_notifications?.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                لا توجد إشعارات حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, bg, noCurrency = false }) {
  return (
    <div className={`rounded text-white shadow-md ${bg} p-4`}>
      <div className="text-sm">{label}</div>
      <div className="text-2xl font-bold mt-2">
        {value ?? 0} {!noCurrency && '₪'}
      </div>
    </div>
  );
}
