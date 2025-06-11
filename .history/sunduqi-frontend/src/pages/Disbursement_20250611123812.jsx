import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Disbursement() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [recipientName, setRecipientName] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'visa' && !attachment) {
      return alert('يجب إرفاق صورة عند الدفع بالفيزا');
    }

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('branch_id', user.branch_id);
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod);
    formData.append('recipient_name', recipientName);
    formData.append('notes', notes);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const res = await axios.post('/disbursements', formData);
      navigate(`/disbursement/${res.data.id}`);
    } catch (err) {
      alert('فشل في حفظ سند الصرف');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">سند صرف</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          {/* المبلغ */}
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ (₪)</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* طريقة الدفع */}
          <div>
            <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">كاش</option>
              <option value="visa">فيزا</option>
            </select>
          </div>

          {/* إرفاق صورة للفيزا */}
          {paymentMethod === 'visa' && (
            <div>
              <label className="block text-sm font-medium mb-1">إرفاق صورة (للفيزا)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
          )}

          {/* اسم المستفيد */}
          <div>
            <label className="block text-sm font-medium mb-1">اسم المستفيد</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          {/* البيان */}
          <div>
            <label className="block text-sm font-medium mb-1">البيان</label>
            <textarea
              rows="3"
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm shadow-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* زر الإرسال */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-semibold"
          >
            حفظ السند
          </button>
        </form>
      </div>
    </div>
  );
}
