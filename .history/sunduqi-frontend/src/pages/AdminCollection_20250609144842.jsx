import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    axios.get(`/cash-collections/grouped?date=${today}`)
      .then(res => setGroups(res.data))
      .catch(() => toast.error('فشل في تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (group) => {
    try {
      await axios.post('/cash-collections', {
        branch_id: group.branch_id,
        collection_date: today,
        total_collected: group.total_delivered,
        notes: `استلام من ${group.user.full_name}`
      });
      toast.success('تم الاستلام بنجاح');
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
