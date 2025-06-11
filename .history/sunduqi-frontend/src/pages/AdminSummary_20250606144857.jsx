import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function AdminSummary() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [data, setData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  // تحميل الفروع
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await axios.get('/branches?limit=1000');
        setBranches(res.data.data || []);
      } catch (error) {
        console.error('فشل تحميل الفروع:', error);
      }
    };
    loadBranches();
  }, []);

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedBranch) params.branch_id = selectedBranch;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const res = await axios.get('/branches/branch-totals', { params });
        setData(res.data || []);
      } catch (err) {
        console.error('فشل تحميل البيانات:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedBranch, fromDate, toDate]);

  const totalReceipts = data.reduce((sum, b) => sum + Number(b.total_receipts || 0), 0);
  const totalDisbursements = data.reduce((sum, b) => sum + Number(b.total_disbursements || 0), 0);
  const totalMatching = totalReceipts - totalDisbursements;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((branch) => ({
        الفرع: branch.branch_name,
        المقبوضات: Number(branch.total_receipts).toFixed(2),
        المصروفات: Number(branch.total_disbursements).toFixed(2),
        المطابقة: (
          Number(branch.total_receipts) - Number(branch.total_disbursements)
        ).toFixed(2),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'مطابقة المجاميع');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'مطابقة_المجاميع.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">مطابقة المجاميع</h1>

        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm mb-1">من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">الفرع</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">جميع الفروع</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name_ar}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📤 تصدير إلى Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-6">جاري التحميل...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">الفرع</th>
                    <th className="p-2 border">المقبوضات</th>
                    <th className="p-2 border">المصروفات</th>
                    <th className="p-2 border">المطابقة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((branch) => (
                    <tr key={branch.branch_id} className="hover:bg-gray-100">
                      <td className="p-2 border">{branch.branch_name}</td>
                      <td className="p-2 border">{Number(branch.total_receipts).toFixed(2)}</td>
                      <td className="p-2 border">{Number(branch.total_disbursements).toFixed(2)}</td>
                      <td className="p-2 border">
                        {(Number(branch.total_receipts) - Number(branch.total_disbursements)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 border rounded-lg shadow bg-gray-50 space-y-2">
              <h2 className="font-bold text-lg">المجاميع الكلية</h2>
              <p>💰 مجموع المقبوضات: {totalReceipts.toFixed(2)}</p>
              <p>💸 مجموع المصروفات: {totalDisbursements.toFixed(2)}</p>
              <p>✅ مجموع المطابقة: {totalMatching.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
