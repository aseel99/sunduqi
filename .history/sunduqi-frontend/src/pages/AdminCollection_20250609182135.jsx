import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0]; // ✅ مفعل

  useEffect(() => {
    axios.get(`/cash-collections/grouped?date=${today}`)
      .then(res => {
        const dataWithFlags = res.data.map(item => ({
          ...item,
          isCollected: false
        }));
        setGroups(dataWithFlags);
      })
      .catch((err) => {
        console.error('❌ Error loading groups:', err);
        toast.error('فشل في تحميل البيانات');
      })
      .finally(() => setLoading(false));
  }, [today]);

  const handleCollect = async (group, index) => {
    const payload = {
      branch_id: group.branch_id,
      collection_date: today,
      total_collected: group.total_delivered,
      notes: `استلام من ${group.user.full_name}`
    };

    try {
      console.log('📤 Sending collection:', payload);

      await axios.post('/cash-collections', payload);

      toast.success('تم الاستلام بنجاح');

      // ✅ تحديث العنصر المحلي لتجنب الصفحة البيضاء
      setGroups(prev => {
        const updated = [...prev];
        updated[index].isCollected = true;
        return updated;
      });

      // يمكنك استخدام هذا بدلًا من التحديث الموضعي:
      // window.location.reload();

    } catch (err) {
      console.error('🔴 Error in handleCollect:', err);
      toast.error('فشل في الاستلام');
    }
  };

  if (loading) return <div className="text-center mt-6">جاري التحميل...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">الاستلام اليومي</h2>
      {groups.length === 0 ? (
        <div className="text-gray-500 text-center">لا توجد مجاميع للاستلام اليوم</div>
      ) : (
        groups.map((g, idx) => (
          <div key={idx} className="border p-4 mb-3 rounded shadow bg-white flex justify-between items-center">
            <div>
              <p><strong>المستخدم:</strong> {g.user?.full_name}</p>
              <p><strong>الفرع:</strong> {g.branch?.name_ar}</p>
              <p><strong>المبلغ:</strong> {g.total_delivered} د.أ</p>
            </div>
            {g.isCollected ? (
              <span className="text-green-600 font-semibold">تم الاستلام ✅</span>
            ) : (
              <button
                onClick={() => handleCollect(g, idx)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                استلام
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
