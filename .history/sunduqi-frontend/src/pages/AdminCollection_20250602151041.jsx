import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminCollection() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    axios.get('/cash_deliveries').then((res) => setDeliveries(res.data));
  }, []);

  const handleVerify = async (id) => {
    await axios.post(`/cash-deliveries/${id}/verify`);
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_verified: true } : d))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-right p-6">
      <h2 className="text-2xl font-bold mb-4">استلام الكاش من الفروع</h2>
      <div className="space-y-4">
        {deliveries.map((d) => (
          <div key={d.id} className="bg-white p-4 rounded shadow text-sm">
            <div>الفرع: {d.branch_name}</div>
            <div>المبلغ: {d.delivered_amount} د.أ</div>
            <div>التاريخ: {new Date(d.date).toLocaleDateString()}</div>
            <div>المستخدم: {d.user_name}</div>
            <div className="mt-2">
              {d.is_verified ? (
                <span className="text-green-600 font-bold">تم الاستلام</span>
              ) : (
                <button
                  onClick={() => handleVerify(d.id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  استلام
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
