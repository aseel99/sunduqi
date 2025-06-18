import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [grouped, setGrouped] = useState([]);
  const [collected, setCollected] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState('uncollected');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCollectionsData = async () => {
    setLoading(true);
    setError(false);
    const dateParam = filterDate ? `?date=${filterDate}` : '';

    try {
      // التسليمات غير المستلمة
      const groupedRes = await axios.get(`/cash-collections/grouped${dateParam}`);
      setGrouped(groupedRes.data);

      // التسليمات المستلمة
      const collectedRes = await axios.get(`/cash-collections${dateParam}`);
      setCollected(collectedRes.data.data); // ← لاحظ أن البيانات داخل .data
    } catch (err) {
      console.error('❌ Error fetching collections:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionsData();
  }, [filterDate]);

  const handleCollect = async (group) => {
    const payload = {
      branch_id: delivery.branch_id,
      collection_date: filterDate || new Date().toISOString().split('T')[0],
      total_collected: delivery.delivered_amount,
      notes: `استلام من ${delivery.user?.full_name || 'مستخدم غير معروف'}`,
      user_id: delivery.user_id,
      delivery_id: delivery.id // 🆕 تحديد السند المطلوب استلامه فقط
    };


    try {
      await axios.post('/cash-collections', payload);
      toast.success('✅ تم الاستلام بنجاح');
      fetchCollectionsData();
    } catch (err) {
      console.error('🔴 Error in handleCollect:', err);
      toast.error('فشل في الاستلام');
    }
  };

  const renderGroupItem = (item, idx, isCollected = false) => (
    <div key={idx} className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 text-sm text-gray-800">
        <p><span className="font-semibold text-gray-600">المستخدم:</span> {item.user?.full_name}</p>
        <p><span className="font-semibold text-gray-600">الفرع:</span> {item.branch?.name_ar}</p>
        <p><span className="font-semibold text-gray-600">المبلغ:</span>{' '}
          <span className="text-green-700 font-bold">
            {parseFloat(item.total_collected || item.total_delivered).toLocaleString()} ₪
          </span>
        </p>
      </div>
      {isCollected ? (
        <span className="inline-block text-sm text-green-600 font-semibold px-4 py-1 border border-green-200 rounded-md bg-green-50">
          ✅ تم الاستلام
        </span>
      ) : (
        <button
          onClick={() => handleCollect(item)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow"
        >
          استلام
        </button>
      )}
    </div>
  );

  const currentList = activeTab === 'uncollected' ? grouped : collected;

  return (
    <div className="p-4 md:p-6 font-[Tajawal] text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">الاستلام اليومي</h2>

      {/* فلتر التاريخ */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-gray-600">تصفية بالتاريخ:</label>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="text-red-500 text-sm underline"
          >
            إعادة تعيين
          </button>
        )}
      </div>

      {/* التبويبات */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'uncollected' ? 'border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('uncollected')}
        >
          غير مستلمة
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'collected' ? 'border-b-4 border-green-500 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('collected')}
        >
          تم استلامها
        </button>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="text-center text-gray-600">جاري التحميل...</div>
      ) : error ? (
        <div className="text-red-600 text-center">⚠️ حدث خطأ أثناء تحميل البيانات.</div>
      ) : currentList.length === 0 ? (
        <div className="text-gray-500 text-center">لا توجد بيانات</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentList.map((item, idx) => renderGroupItem(item, idx, activeTab === 'collected'))}
        </div>
      )}
    </div>
  );
}
