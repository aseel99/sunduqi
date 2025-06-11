import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminPending() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/cash-deliveries')
      .then(res => {
        const today = new Date().toISOString().split('T')[0];
        const filtered = res.data.filter(delivery =>
          delivery.is_verified &&
          !delivery.is_collected &&
          delivery.date < today
        );

        setPending(filtered);
      })
      .catch(err => {
        console.error('❌ فشل تحميل السندات المتأخرة:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h2 className="text-2xl font-bold mb-4">السندات المتأخرة</h2>

      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : pending.length === 0 ? (
        <div className="text-gray-500">لا يوجد سندات متأخرة</div>
      ) : (
        <div className="space-y-4">
          {pending.map((v, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow text-sm">
              <div>الفرع: {v.branch?.name_ar}</div>
              <div>المستخدم: {v.user?.full_name}</div>
              <div>المبلغ: {v.delivered_amount} د.أ</div>
              <div>التاريخ: {new Date(v.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
