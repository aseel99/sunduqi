import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminPending() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    axios.get('/cash-deliveries/pending')
      .then(res => {
        const dataWithFlags = res.data.map(item => ({
          ...item,
          isCollected: false
        }));
        setGroups(dataWithFlags);
      })
      .catch((err) => {
        console.error('❌ Error loading pending:', err);
        toast.error('فشل في تحميل البيانات المتأخرة');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (group) => {
    setProcessing(group.user_id);
    try {
      const payload = {
        branch_id: group.branch_id,
        collection_date: new Date().toISOString().split('T')[0],
        total_collected: group.total_delivered,
        notes: `استلام متأخر من ${group.user.full_name}`
      };

      await axios.post('/cash-collections', payload);
      toast.success('تم الاستلام بنجاح');
      setGroups(prev => prev.filter(g => g.user_id !== group.user_id || g.branch_id !== group.branch_id));
    } catch (err) {
      console.error('❌ Error collecting:', err);
      toast.error('فشل في تنفيذ عملية الاستلام');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h2 className="text-2xl font-bold mb-4">الاستلامات المتأخرة</h2>
      <div className="space-y-4">
        {groups.length === 0 && <div className="text-gray-500">لا يوجد بيانات متأخرة</div>}
        {groups.map((group) => (
          <div key={`${group.user_id}-${group.branch_id}`} className="bg-white p-4 rounded shadow text-sm">
            <div>الفرع: {group.branch?.name_ar}</div>
            <div>المستخدم: {group.user?.full_name}</div>
            <div>الإجمالي: {group.total_delivered}</div>
            <button
              onClick={() => handleCollect(group)}
              disabled={processing === group.user_id}
              className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              {processing === group.user_id ? 'جارٍ الاستلام...' : 'استلام'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
