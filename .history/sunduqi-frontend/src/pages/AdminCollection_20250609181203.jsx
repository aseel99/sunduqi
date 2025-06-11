import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];


  useEffect(() => {
    axios.get(`/cash-collections/grouped?date=${today}`)
      .then(res => {
        const dataWithFlags = res.data.map(item => ({
          ...item,
          isCollected: false // 👈 إضافة هذه العلامة محلياً
        }));
        setGroups(dataWithFlags);
      })
      .catch(() => toast.error('فشل في تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (group, index) => {
    try {
      await axios.post('/cash-collections', {
        branch_id: group.branch_id,
        user_id: group.user_id,
        total_amount: group.total_delivered,
      });
      toast.success('تم الاستلام بنجاح');

      // ✅ تحديث العنصر المستلم فقط
      setGroups(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, isCollected: true } : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('فشل في الاستلام');
    }
  };

  if (loading) return <div className="text-center mt-6">جاري التحميل...</div>;

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
      ))}
    </div>
  );
}
