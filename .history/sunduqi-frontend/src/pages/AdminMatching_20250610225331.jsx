import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import DateFilter from '../components/DateFilter';

const AdminMatching = () => {
  const [matchings, setMatchings] = useState([]);
  const [filteredDate, setFilteredDate] = useState(dayjs().format('YYYY-MM-DD'));

  const fetchMatchings = async () => {
    try {
      const res = await axios.get(`/api/cash-matching?date=${filteredDate}`);
      setMatchings(res.data);
    } catch (err) {
      console.error('Error fetching matchings:', err);
    }
  };

  useEffect(() => {
    fetchMatchings();
  }, [filteredDate]);

  const resolveMatching = async (id) => {
    try {
      await axios.post(`/api/cash-matching/resolve/${id}`);
      fetchMatchings();
    } catch (err) {
      console.error('Error resolving matching:', err);
    }
  };

  const MatchingTable = () => (
    <table className="w-full text-sm text-right text-gray-700 border">
      <thead className="bg-gray-100 text-gray-900 text-xs">
        <tr>
          <th className="px-2 py-1 border">الفرع</th>
          <th className="px-2 py-1 border">التاريخ</th>
          <th className="px-2 py-1 border">المبلغ المتوقع</th>
          <th className="px-2 py-1 border">المبلغ الفعلي</th>
          <th className="px-2 py-1 border">فرق</th>
          <th className="px-2 py-1 border">الملاحظات</th>
          <th className="px-2 py-1 border">تمت المطابقة</th>
          <th className="px-2 py-1 border">مطابقة بواسطة</th>
          <th className="px-2 py-1 border">الإجراء</th>
        </tr>
      </thead>
      <tbody>
        {matchings.map((m) => {
          const expected = Number(m.expected_total) || 0;
          const actual = Number(m.actual_total) || 0;
          const difference = expected - actual;

          return (
            <tr key={m.id} className="border-t">
              <td className="px-2 py-1 border">{m.branch?.name_ar}</td>
              <td className="px-2 py-1 border">{m.date}</td>
              <td className="px-2 py-1 border">{expected.toFixed(2)}</td>
              <td className="px-2 py-1 border">{actual.toFixed(2)}</td>
              <td className="px-2 py-1 border">{difference.toFixed(2)}</td>
              <td className="px-2 py-1 border">{m.notes || '-'}</td>
              <td className="px-2 py-1 border">{m.is_resolved ? 'نعم' : 'لا'}</td>
              <td className="px-2 py-1 border">{m.resolver?.full_name || '-'}</td>
              <td className="px-2 py-1 border">
                {!m.is_resolved && (
                  <button
                    onClick={() => resolveMatching(m.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    مطابقة
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">مطابقة الكاش - الادمن</h1>
      <DateFilter date={filteredDate} onChange={setFilteredDate} />
      <div className="mt-4">
        {matchings.length > 0 ? <MatchingTable /> : <p>لا توجد سجلات مطابقة.</p>}
      </div>
    </div>
  );
};

export default AdminMatching;
