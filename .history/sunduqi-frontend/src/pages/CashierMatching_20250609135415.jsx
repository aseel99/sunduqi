// ✅ CashierMatching.jsx
// Displays the cashier's matching summary, allows confirming the match and delivering matched cash with full logging

import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function CashierMatching() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [actualTotal, setActualTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [matchedTotal, setMatchedTotal] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ⏬ Fetch summary and matched total
  useEffect(() => {
    const loadSummary = async () => {
      try {
        console.log('🔍 Fetching matching summary...');
        const { data } = await axios.get('/cash-matching/matching-summary', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
          },
          headers,
        });
        console.log('✅ Summary data:', data);
        setSummary(data);
      } catch (err) {
        console.error('❌ Failed loading summary:', err);
        setMessage('Failed to load summary');
      }
    };

    const loadMatchedTotal = async () => {
      try {
        console.log('🔍 Fetching matched total...');
        const { data } = await axios.get('/cash-deliveries/matched-total', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
            date: today,
          },
          headers,
        });
        console.log('✅ Matched total:', data);
        setMatchedTotal(data.matched_total);
      } catch (err) {
        console.error('❌ Failed loading matched total:', err);
      }
    };

    (async () => {
      await loadSummary();
      await loadMatchedTotal();
      setLoading(false);
    })();
  }, [user]);

  // ⏫ Send matching confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        user_id: user.id,
        branch_id: user.branch_id,
        expected_total: summary.expected_total,
        actual_total: parseFloat(actualTotal),
        notes,
        date: today,
      };

      console.log('📤 Sending confirmation body:', body);
      const res = await axios.post('/cash-matching/confirm', body, { headers });
      console.log('✅ Confirmation response:', res.data);
      setMessage('✅ Matching saved successfully');
    } catch (err) {
      console.error('❌ Submit failed:', err.response?.data || err.message);
      setMessage('❌ Failed to save matching');
    }
  };

  // ⏫ Send matched delivery request
  const handleDeliver = async () => {
    try {
      const body = {
        user_id: user.id,
        branch_id: user.branch_id,
        amount: matchedTotal,
        date: today,
      };

      console.log('📤 Deliver matched cash:', body);
      const res = await axios.post('/cash-deliveries/deliver-matched', body, { headers });
      console.log('✅ Delivery response:', res.data);
      setMessage('✅ Matched cash delivered successfully');
    } catch (err) {
      console.error('❌ Delivery failed:', err.response?.data || err.message);
      setMessage('❌ Failed to deliver matched cash');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!summary) return <div className="text-center mt-10 text-red-600">Failed to load summary.</div>;

  const difference = actualTotal
    ? (parseFloat(actualTotal) - parseFloat(summary.expected_total)).toFixed(2)
    : '---';

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Cashier Matching</h2>
        <div className="space-y-2 text-sm mb-4">
          <div>Total Receipts: {summary.total_receipts} JOD</div>
          <div>Total Disbursements: {summary.total_disbursements} JOD</div>
          <div className="font-bold">Expected Total: {summary.expected_total} JOD</div>
        </div>

        {message && <div className="mb-4 text-blue-600 font-bold">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 text-sm">Actual Total</label>
          <input
            type="number"
            required
            value={actualTotal}
            onChange={(e) => setActualTotal(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <div className="mb-4 text-sm">
            Difference: <span className="font-bold text-red-600">{difference} JOD</span>
          </div>
          <label className="block mb-1 text-sm">Notes</label>
          <textarea
            className="w-full mb-4 p-2 border border-gray-300 rounded"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Confirm Matching
          </button>
        </form>

        {matchedTotal !== null && (
          <>
            <div className="mt-6 text-green-700 text-sm font-bold">
              Matched Cash for Today: {matchedTotal.toLocaleString()} JOD
            </div>
            <button
              onClick={handleDeliver}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Deliver Matched Cash
            </button>
          </>
        )}
      </div>
    </div>
  );
}
