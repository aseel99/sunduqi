// src/pages/BankTransferPage.jsx
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function BankTransferPage() {
  const { user } = useAuth();
  const [branchTotals, setBranchTotals] = useState([]);
  const [transferred, setTransferred] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!selectedDate) return;
    axios.get(`/admin/summary?date=${selectedDate}`)
      .then((res) => setBranchTotals(res.data))
      .catch(() => toast.error('فشل تحميل المجاميع'));

  }, [selectedDate]);

  useEffect(() => {
    // Check which branches are already transferred
    if (!selectedDate) return;
    branchTotals.forEach(branch => {
      axios.get(`/bank-transfer/check?branch_id=${branch.branch_id}&date=${selectedDate}`)
        .then(res => {
          if (res.data.transferred) {
            setTransferred(prev => ({ ...prev, [branch.branch_id]: res.data.amount }));
          }
        });
    });
  }, [branchTotals, selectedDate]);

  const handleInputChange = (branchId, value) => {
    setInputValues(prev => ({ ...prev, [branchId]: value }));
  };

  const handleTransfer = async (branch) => {
    const amount = parseFloat(inputValues[branch.branch_id] || 0);
    try {
      await axios.post('/bank-transfer/confirm', {
        branch_id: branch.branch_id,
        date: selectedDate,
        total_receipts: branch.total_receipts,
        total_disbursements: branch.total_disbursements,
        final_balance: amount,
      });
      toast.success('تم ترحيل المبلغ بنجاح');
      setTransferred(prev => ({ ...prev, [branch.branch_id]: amount }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في ترحيل المبلغ');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ترحيل المبالغ للبنك</h2>
      <label>اختر التاريخ:</label>
      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border px-2 py-1 mb-4" />

      {branchTotals.map(branch => {
        const alreadyTransferred = transferred[branch.branch_id] || 0;
        const remaining = branch.final_balance - alreadyTransferred;

        return (
          <div key={branch.branch_id} className="border rounded p-4 mb-4 shadow">
            <h3 className="font-bold">{branch.branch_name}</h3>
            <p>الإجمالي: {branch.final_balance.toFixed(2)} دينار</p>
            <p>مرحّل مسبقاً: {alreadyTransferred} دينار</p>
            <p>المتبقي: {remaining.toFixed(2)} دينار</p>
            <input
              type="number"
              value={inputValues[branch.branch_id] || ''}
              onChange={e => handleInputChange(branch.branch_id, e.target.value)}
              className="border px-2 py-1 mt-2"
              placeholder="أدخل المبلغ للترحيل"
            />
            <button
              onClick={() => handleTransfer(branch)}
              className="bg-green-600 text-white px-3 py-1 mt-2 ml-2 rounded"
              disabled={remaining <= 0}
            >
              ترحيل
            </button>
          </div>
        );
      })}
    </div>
  );
}
