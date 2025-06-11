import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { format } from 'date-fns';

export default function OpeningBalanceForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ amount: '', notes: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const payload = {
        branch_id: user.branch_id,
        amount: parseFloat(formData.amount),
        date: today,
        notes: formData.notes.trim() || undefined
      };

      const response = await axios.post('/opening-balances', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setMessage({ text: '✅ تم حفظ الرصيد الافتتاحي بنجاح', type: 'success' });
        setFormData({ amount: '', notes: '' });
      } else {
        setMessage({ text: response.data.message || 'حدث خطأ أثناء الحفظ', type: 'error' });
      }
    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || 'حدث خطأ غير متوقع';
      if (errorMsg.includes('already exists') || err.response?.status === 409) {
        errorMsg = '⚠️ تم إدخال الرصيد الافتتاحي لهذا اليوم مسبقاً.';
      }
      setMessage({ text: `خطأ: ${errorMsg}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-[Tajawal] text-right" dir="rtl">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">إدخال الرصيد الافتتاحي</h2>

        {message.text && (
          <div
            className={`mb-5 p-3 rounded text-sm font-medium flex items-center ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* المبلغ */}
          <div>
            <label htmlFor="amount" className="block text-sm mb-1 text-gray-700">
              المبلغ (₪) *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          {/* الملاحظات */}
          <div>
            <label htmlFor="notes" className="block text-sm mb-1 text-gray-700">
              ملاحظات (اختياري)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              value={formData.notes}
              onChange={handleChange}
              placeholder="يمكنك كتابة ملاحظات توضيحية"
            />
          </div>

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded text-white text-sm font-semibold transition ${
              isSubmitting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الرصيد'}
          </button>
        </form>
      </div>
    </div>
  );
}
