import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminMatching() {
  const [approvedMatchings, setApprovedMatchings] = useState([]);
  const [pendingMatchings, setPendingMatchings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApproved();
    fetchPending();
  }, []);

  const fetchApproved = async () => {
    try {
      const res = await axios.get('/cash-matching?is_verified=true');
      setApprovedMatchings(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل المطابقات المعتمدة');
    }
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get('/cash-matching?is_verified=false');
      setPendingMatchings(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل المطابقات غير المعتمدة');
    }
  };

  const renderTable = (data) => (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border text-sm text-right bg-white shadow-md rounded">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">الفرع</th>
            <th className="p-2 border">التاريخ</th>
            <th className="p-2 border">المبلغ المدخل</th>
            <th className="p-2 border">المبلغ الفعلي</th>
            <th className="p-2 border">الفارق</th>
            <th className="p-2 border">المستخدم</th>
            <th className="p-2 border">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((match) => (
              <tr key={match.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{match.branch?.name_ar || '—'}</td>
                <td className="p-2 border">{new Date(match.date).toLocaleDateString()}</td>
                <td className="p-2 border">{match.entered_total}</td>
                <td className="p-2 border">{match.actual_total}</td>
                <td className="p-2 border">{(parseFloat(match.entered_total) - parseFloat(match.actual_total)).toFixed(2)}</td>
                <td className="p-2 border">{match.user?.full_name || '—'}</td>
                <td className="p-2 border">{match.notes || '—'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                لا يوجد بيانات لعرضها
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-right">مطابقة الإدمن</h1>

      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          غير المعتمدة
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('approved')}
        >
          المعتمدة
        </button>
      </div>

      {activeTab === 'pending' ? renderTable(pendingMatchings) : renderTable(approvedMatchings)}
    </div>
  );
}