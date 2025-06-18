import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns-jalali';
import { useAuth } from '../auth/AuthContext';

export default function AdminPending() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [collected, setCollected] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/cash-deliveries/pending-vouchers');
      const all = res.data || [];

      const notCollected = all.filter(d => !d.is_collected);
      const collectedList = all.filter(d => d.is_collected);

      setPending(notCollected);
      setCollected(collectedList);
    } catch (err) {
      toast.error('فشل في تحميل السندات المتأخرة');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (delivery) => {
    const payload = {
      delivery_id: delivery.id,
      branch_id: delivery.branch.id,
      collection_date: today,
      total_collected: delivery.delivered_amount,
      notes: `استلام تسليم رقم ${delivery.delivery_number}`,
      user_id: delivery.user.id
    };

    try {
      const res = await axios.post('/cash-collections', payload);
      toast.success('✅ تم استلام السند بنجاح');
      fetchDeliveries();
    } catch (err) {
      toast.error('❌ فشل في استلام السند');
    }
  };

  const renderDelivery = (delivery, isCollected = false) => (
    <div key={delivery.id} className={`p-4 rounded-xl shadow mb-4 border ${isCollected ? 'bg-green-50' : 'bg-white'}`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold text-lg">رقم السند: {delivery.delivery_number}</div>
          <div>اسم المستخدم: {delivery.user.full_name}</div>
          <div>الفرع: {delivery.branch.name_ar}</div>
          <div>التاريخ: {format(new Date(delivery.date), 'yyyy-MM-dd HH:mm')}</div>
          <div>المبلغ المسلم: <span className="font-bold text-blue-700">{delivery.delivered_amount.toFixed(2)} دينار</span></div>
        </div>
        {!isCollected && (
          <button
            onClick={() => handleCollect(delivery)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            استلام
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">السندات المتأخرة (غير المستلمة)</h1>
      {loading && <div>جاري التحميل...</div>}
      {!loading && pending.length === 0 && <div className="text-gray-500">لا يوجد سندات متأخرة غير مستلمة.</div>}
      {pending.map(d => renderDelivery(d))}

      <h2 className="text-lg font-bold mt-8 mb-4">السندات المستلمة</h2>
      {collected.length === 0 && <div className="text-gray-500">لا يوجد سندات مستلمة.</div>}
      {collected.map(d => renderDelivery(d, true))}
    </div>
  );
}
