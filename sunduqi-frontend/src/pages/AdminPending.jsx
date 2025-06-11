import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminPending() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    axios.get('/cash-deliveries/pending-vouchers')
      .then(res => {
        const dataWithFlags = res.data.map(item => ({
          ...item,
          isCollected: false
        }));
        setGroups(dataWithFlags);
        setHasError(false);
      })
      .catch(err => {
        console.error('❌ Error loading pending vouchers:', err);
        setGroups([]);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (group, index) => {
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      branch_id: group.branch_id,
      collection_date: today,
      total_collected: group.total_delivered,
      notes: `استلام متأخر من ${group.user.full_name}`,
      user_id: group.user.id
    };

    try {
      await axios.post('/cash-collections', payload);
      toast.success('تم الاستلام بنجاح');

      setGroups(prev => {
        const updated = [...prev];
        updated[index].isCollected = true;
        return updated;
      });
    } catch (err) {
      console.error('🔴 Error in handleCollect:', err);
      toast.error('فشل في الاستلام');
    }
  };

  if (loading) return (
    <div className="text-center mt-6 text-gray-500 font-[Tajawal]" dir="rtl">
      جاري التحميل...
    </div>
  );

  return (
    <div className="p-4 md:p-6 font-[Tajawal] text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6">السندات المتأخرة</h2>

      {hasError ? (
        <div className="text-red-600 text-center">⚠️ حدث خطأ أثناء تحميل البيانات.</div>
      ) : groups.length === 0 ? (
        <div className="text-gray-500 text-center">لا توجد سندات متأخرة غير مستلمة</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map((g, idx) => (
            <div key={idx} className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 text-sm text-gray-800">
                <p><span className="font-semibold text-gray-600">المستخدم:</span> {g.user?.full_name}</p>
                <p><span className="font-semibold text-gray-600">الفرع:</span> {g.branch?.name_ar}</p>
                <p><span className="font-semibold text-gray-600">المبلغ:</span> <span className="text-green-700 font-bold">{g.total_delivered?.toLocaleString()} ₪</span></p>
              </div>
              <div>
                {g.isCollected ? (
                  <span className="inline-block text-sm text-green-600 font-semibold px-4 py-1 border border-green-200 rounded-md bg-green-50">
                    ✅ تم الاستلام
                  </span>
                ) : (
                  <button
                    onClick={() => handleCollect(g, idx)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow"
                  >
                    استلام
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
