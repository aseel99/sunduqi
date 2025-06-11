// CashierMatching.jsx
// ✅ Displays the cashier's summary and allows them to confirm matching and deliver matched cash.

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    const loadSummary = async () => {
      try {
        console.log('🔍 Fetching matching summary...');
        const res = await axios.get('/cash-matching/matching-summary', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        });
        console.log('✅ Summary data:', res.data);
        setSummary(res.data);
      } catch (err) {
        console.error('❌ Failed to load summary:', err);
        setMessage('❌ Failed to load summary');
      }
    };

    const loadMatchedTotal = async () => {
      try {
        console.log('🔍 Fetching matched total...');
        const res = await axios.get('/cash-deliveries/matched-total', {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
            date: today,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        });
        console.log('✅ Matched total:', res.data);
        setMatchedTotal(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch matched total:', err);
      }
    };

    loadSummary();
    loadMatchedTotal();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/cash-matching/confirm',
        {
          user_id: user.id,
          branch_id: user.branch_id,
          expected_total: summary.expected_total,
          actual_total: parseFloat(actualTotal),
          notes,
          date: new Date().toISOString().split('T')[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('✅ Matching saved successfully');
    } catch (err) {
      console.error('❌ Submit failed:', err);
      setMessage('❌ Failed to save matching');
    }
  };

  const handleDeliver = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/cash-deliveries/deliver-matched',
        {
          user_id: user.id,
          branch_id: user.branch_id,
          amount: Number(matchedTotal.expected_balance),
          date: new Date().toISOString().split('T')[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('✅ Matched balance delivered successfully');
    } catch (err) {
      console.error('❌ Deliver failed:', err);
      setMessage('❌ Failed to deliver matched balance');
    }
  };

  if (!summary) return <div className="text-center mt-10">Loading...</div>;

  const difference = actualTotal
    ? (parseFloat(actualTotal) - parseFloat(summary.expected_total)).toFixed(2)
    : '---';

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Cash Matching</h2>
        <div className="space-y-2 text-sm mb-4">
          <div>Receipts: {summary.total_receipts} JOD</div>
          <div>Disbursements: {summary.total_disbursements} JOD</div>
          <div className="font-bold">Expected Balance: {summary.expected_total} JOD</div>
        </div>
        {message && <div className="mb-4 text-blue-600 font-bold">{message}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-1 text-sm">Actual Balance</label>
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
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Confirm Matching
          </button>
        </form>

        {matchedTotal && matchedTotal.expected_balance && (
          <>
            <div className="mt-6 text-green-700 text-sm font-bold">
              Matched Cash for Today: {Number(matchedTotal.expected_balance).toLocaleString()} JOD
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
