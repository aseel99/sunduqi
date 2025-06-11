import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`/cash-collections/grouped?date=${today}`);

        if (Array.isArray(res.data)) {
          setGroups(res.data);
          setError(false); // ✅ تأكيد عدم وجود خطأ
        } else {
          setGroups([]);
        }
      } catch (err) {
        console.error('❌ Error loading groups:', err);
        setError(true);
        // ✅ عرض الإشعار لمرة واحدة فقط عند وجود خطأ حقيقي
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [today]);

  const handleCollect = async (group) => {
    const payload = {
      branch_id: group.branch_id,
      collection_date: today,
      total_collected: group.total_delivered,
      notes: `استلام من ${group.user.full_name}`
    };

    try {
      await axios.post('/cash-collections', payload);
      toast.success('تم الاستلام بنجاح');
      window.location.reload(); // ✅ تحديث الصفحة بعد النجاح
    } catch (err) {
      console.error('🔴 Error in handleCollect:', err);
      toast.error('فشل في الاستلام');
    }
  };

  if (loading) return <div className="text-center mt-6">جاري التحميل...</div>;

  if (error) {
    return <div className="text-red-600 text-center mt-10">حدث خطأ أثناء تحميل البيانات.</div>;
  }

  if (groups.length === 0) {
    return <div className="text-gray-500 text-center mt-10">لا توجد مجاميع للاستلام اليوم</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">الاستلام اليومي</h2>
      {groups.map((g, idx) => (
        <div key={idx} className="border p-4 mb-3 rounded shadow bg-white flex justify-between items-center">
          <div>
            <p><strong>المستخدم:</strong> {g.user?.full_name}</p>
            <p><strong>الفرع:</strong> {g.branch?.name_ar}</p>
            <p><strong>المبلغ:</strong> {g.total_delivered} د.أ</p>
          </div>
          <button
            onClick={() => handleCollect(g)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            استلام
          </button>
        </div>
      ))}
    </div>
  );
}
