import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { format } from 'date-fns-jalali';
import { arSA } from 'date-fns/locale';

export default function AdminFinanceSummary() {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    try {
      const res = await axios.get(`/admin/finance-summary?date=${date}`);
      setData(res.data);
    } catch (err) {
      console.error('فشل في تحميل البيانات');
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className="font-[Tajawal] text-gray-800" dir="rtl">
      {/* عنوان الصفحة */}
      <h1 className="text-2xl font-bold mb-6 text-yellow-600">ملخص المقبوضات والمصروفات</h1>

      {/* التاريخ */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <label htmlFor="date" className="text-sm font-medium text-gray-700">اختر التاريخ:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-gray-500 text-sm">إجمالي المقبوضات</p>
          <p className="text-xl font-bold text-green-600">{data?.total_income?.toLocaleString()} ₪</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-gray-500 text-sm">إجمالي المصروفات</p>
          <p className="text-xl font-bold text-red-500">{data?.total_expense?.toLocaleString()} ₪</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-gray-500 text-sm">الرصيد الصافي</p>
          <p className={`text-xl font-bold ${data?.net_total >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {data?.net_total?.toLocaleString()} ₪
          </p>
        </div>
      </div>

      {/* التفاصيل */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="py-3 px-4">النوع</th>
              <th className="py-3 px-4">الوصف</th>
              <th className="py-3 px-4">القيمة</th>
              <th className="py-3 px-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {data?.entries?.length > 0 ? (
              data.entries.map((entry, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{entry.type === 'income' ? 'مقبوض' : 'مصروف'}</td>
                  <td className="py-2 px-4">{entry.description}</td>
                  <td className={`py-2 px-4 font-bold ${entry.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {entry.amount.toLocaleString()} ₪
                  </td>
                  <td className="py-2 px-4">{format(new Date(entry.date), 'yyyy-MM-dd', { locale: arSA })}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-6">لا توجد بيانات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
