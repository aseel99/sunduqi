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
    <div className="min-h-screen bg-gray-100 text-right p-6">
      <div className="bg-white max-w-md mx-auto p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">سند صرف</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label className="block mb-1 text-sm">المبلغ</label>
          <input
            type="number"
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label className="block mb-1 text-sm">طريقة الدفع</label>
          <select
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">كاش</option>
            <option value="visa">فيزا</option>
          </select>

          {paymentMethod === 'visa' && (
            <>
              <label className="block mb-1 text-sm">إرفاق صورة</label>
              <input
                type="file"
                accept="image/*"
                className="w-full mb-4"
                onChange={handleFileChange}
              />
            </>
          )}

          <label className="block mb-1 text-sm">اسم المستفيد</label>
          <input
            type="text"
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />

          <label className="block mb-1 text-sm">البيان</label>
          <textarea
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            حفظ السند
          </button>
        </form>
      </div>
    </div>
  );
}
