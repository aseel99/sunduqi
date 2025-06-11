import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { format } from 'date-fns';

export default function OpeningBalanceForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    notes: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        setMessage({
          text: 'تم حفظ الرصيد الافتتاحي بنجاح ✅',
          type: 'success'
        });
        setFormData({ amount: '', notes: '' });
      } else {
        setMessage({
          text: response.data.message || 'حدث خطأ أثناء الحفظ',
          type: 'error'
        });
      }
    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || 'حدث خطأ غير متوقع';

      // Customize message for unique constraint violation or duplicate entry
      if (
        err.response?.data?.message?.includes('already exists') ||
        err.response?.status === 409
      ) {
        errorMsg = 'تم إدخال الرصيد الافتتاحي لهذا اليوم مسبقاً.';
      }

      setMessage({
        text: `خطأ: ${errorMsg}`,
        type: 'error'
      });
      console.error('Submission error:', err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">إدخال الرصيد الافتتاحي</h2>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm mb-1 text-gray-700">
              المبلغ *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm mb-1 text-gray-700">
              ملاحظات (اختياري)
            </label>
            <textarea
              id="notes"
              name="notes"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded text-white ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>
      </div>
    </div>
  );
}
