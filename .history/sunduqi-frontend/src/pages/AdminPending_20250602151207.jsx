import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminPending() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    axios.get('/pending-vouchers').then((res) => setPending(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h2 className="text-2xl font-bold mb-4">السندات المتأخرة</h2>
      <div className="space-y-4">
        {pending.map((v) => (
          <div key={v.id} className="bg-white p-4 rounded shadow text-sm">
            <div>النوع: {v.type === 'receipt' ? 'قبض' : 'صرف'}</div>
            <div>الفرع: {v.branch_name}</div>
            <div>المستخدم: {v.user_name}</div>
            <div>المبلغ: {v.amount}</div>
            <div>التاريخ: {new Date(v.created_at).toLocaleDateString()}</div>
          </div>
        ))}
        {pending.length === 0 && <div className="text-gray-500">لا يوجد سندات متأخرة</div>}
      </div>
    </div>
  );
}
