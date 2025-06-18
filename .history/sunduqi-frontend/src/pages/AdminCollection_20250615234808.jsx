import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('uncollected');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get(`/cash-collections/grouped?date=${today}`)
      .then(res => {
        const separated = res.data.reduce(
          (acc, item) => {
            if (item.total_delivered === 0) return acc;
            if (item.is_collected) {
              acc.collected.push(item);
            } else {
              acc.uncollected.push(item);
            }
            return acc;
          },
          { collected: [], uncollected: [] }
        );
        setGroups(separated);
        setHasError(false);
      })
      .catch((err) => {
        console.error('❌ Error loading groups:', err);
        setGroups({ collected: [], uncollected: [] });
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, [today]);

  const handleCollect = async (group) => {
    const payload = {
      branch_id: group.branch_id,
      collection_date: today,
      total_collected: group.total_delivered,
      notes: `استلام من ${group.user.full_name}`,
      user_id: group.user.id
    };

    try {
      await axios.post('/cash-collections', payload);
      toast.success('✅ تم الاستلام بنجاح');

      // نقل المجموعة إلى تبويب "تم الاستلام"
      setGroups(prev => {
        const updatedUncollected = prev.uncollected.filter(g => g.user_id !== group.user_id);
        const updatedCollected = [...prev.collected, { ...group, is_collected: true }];
        return {
          uncollected: updatedUncollected,
          collected: updatedCollected
        };
      });
    } catch (err) {
      console.error('🔴 Error in handleCollect:', err);
      toast.error('فشل في الاستلام');
    }
  };

  const currentGroups = activeTab === 'uncollected' ? groups.uncollected : groups.collected;

  return (
    <div className="p-4 md:p-6 font-[Tajawal] text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">الاستلام اليومي</h2>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'uncollected' ? 'border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('uncollected')}
        >
          التسليمات غير المستلمة
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'collected' ? 'border-b-4 border-green-500 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('collected')}
        >
          التسليمات التي تم استلامها
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">جاري التحميل...</div>
      ) : hasError ? (
        <div className="text-red-600 text-center">⚠️ حدث خطأ أثناء تحميل البيانات.</div>
      ) : currentGroups.length === 0 ? (
        <div className="text-gray-500 text-center">لا توجد بيانات لعرضها</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentGroups.map((g, idx) => (
            <div key={idx} className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 text-sm text-gray-800">
                <p><span className="font-semibold text-gray-600">المستخدم:</span> {g.user?.full_name}</p>
                <p><span className="font-semibold text-gray-600">الفرع:</span> {g.branch?.name_ar}</p>
                <p>
                  <span className="font-semibold text-gray-600">المبلغ:</span>{' '}
                  <span className="text-green-700 font-bold">{parseFloat(g.total_delivered).toLocaleString()} ₪</span>
                </p>
              </div>
              {activeTab === 'uncollected' ? (
                <button
                  onClick={() => handleCollect(g)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow"
                >
                  استلام
                </button>
              ) : (
                <span className="inline-block text-sm text-green-600 font-semibold px-4 py-1 border border-green-200 rounded-md bg-green-50">
                  ✅ تم الاستلام
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
