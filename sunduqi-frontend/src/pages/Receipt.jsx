import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Receipt() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'visa' && !attachment) {
      return alert('يجب إرفاق صورة الفاتورة عند الدفع بالفيزا');
    }

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('branch_id', user.branch_id);
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod);
    formData.append('client_name', clientName);
    formData.append('notes', notes);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const res = await axios.post('/receipts', formData);
      navigate(`/receipt/${res.data.receipt.id}`);
    } catch (err) {
      console.error(err);
      alert('فشل حفظ السند ❌');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-right p-6 font-[Tajawal]" dir="rtl">
      <div className="bg-white max-w-md mx-auto p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">سند قبض</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">المبلغ (₪)</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-green-400 focus:border-green-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">طريقة الدفع</label>
            <select
              className="w-full p-2 border border-gray-300 rounded shadow-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">كاش</option>
              <option value="visa">فيزا</option>
            </select>
          </div>

          {paymentMethod === 'visa' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">إرفاق صورة الفاتورة</label>
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleFileChange}
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">اسم العميل (اختياري)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded shadow-sm"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">البيان</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded shadow-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold transition"
          >
            حفظ السند
          </button>
        </form>
      </div>
    </div>
  );
}
