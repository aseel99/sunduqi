import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';

export default function AdminCollection() {
  const { user } = useAuth();
  const [uncollected, setUncollected] = useState([]);
  const [collected, setCollected] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState('uncollected');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const dateParam = filterDate ? `?date=${filterDate}` : '';

    try {
      const res = await axios.get(`/cash-deliveries/today-status${dateParam}`);
      setUncollected(res.data.uncollected || []);
      setCollected(res.data.collected || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const handleCollect = async (delivery) => {
    const payload = {
      branch_id: delivery.branch_id,
      collection_date: delivery.date,
      total_collected: delivery.delivered_amount,
      notes: `استلام تسليم رقم ${delivery.delivery_number}`,
      user_id: delivery.user_id
    };

    try {
      await axios.post('/cash-collections', payload);
      toast.success('✅ تم الاستلام بنجاح');
      fetchData();
    } catch (err) {
      console.error('❌ فشل الاستلام:', err);
      toast.error('حدث خطأ أثناء الاستلام');
    }
  };

  const renderItem = (item, isCollected) => (
    <div key={item.id} className="bg-white rounded-xl border shadow p-4 space-y-1">
      <div className="text-sm text-gray-800">
        <p><span className="font-semibold text-gray-600">رقم التسليم:</span> {item.delivery_number}</p>
        <p><span className="font-semibold text-gray-600">المستخدم:</span> {item.user?.full_name}</p>
        <p><span className="font-semibold text-gray-600">الفرع:</span> {item.branch?.name_ar}</p>
        <p><span className="font-semibold text-gray-600">التاريخ:</span> {item.date}</p>
        <p><span className="font-semibold text-gray-600">المبلغ:</span>{' '}
          <span className="text-green-700 font-bold">{parseFloat(item.delivered_amount).toLocaleString()} ₪</span>
        </p>
      </div>
      {!isCollected && (
        <button
          onClick={() => handleCollect(item)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-md"
        >
          استلام
        </button>
      )}
      {isCollected && (
        <span className="inline-block text-sm text-green-700 font-semibold">✅ تم الاستلام</span>
      )}
    </div>
  );

  const currentList = activeTab === 'uncollected' ? uncollected : collected;

  return (
    <div className="p-4 md:p-6 font-[Tajawal] text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">سندات التسليم اليومية</h2>

      <div className="mb-4 flex gap-4 items-center">
        <label>تصفية بالتاريخ:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm"
        />
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="text-red-500 text-sm underline">إعادة تعيين</button>
        )}
      </div>

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

      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="grid gap-4">
          {currentList.length > 0 ? (
            currentList.map((item) => renderItem(item, activeTab === 'collected'))
          ) : (
            <div className="text-center text-gray-500">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
