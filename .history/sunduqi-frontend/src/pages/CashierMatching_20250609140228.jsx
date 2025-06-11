// CashierMatching.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../auth/AuthContext';

import MatchingSummaryTable from "./MatchingSummaryTable";
import MatchingForm from "./MatchingForm";
import { useNavigate } from "react-router-dom";

// ✅ This component fetches and displays a cashier's matching summary and expected balance.
// It also allows navigation to the MatchingForm with pre-filled data from the summary.
export default function CashierMatching() {
  const { user } = useUserStore();
  const [matchingSummary, setMatchingSummary] = useState([]);
  const [matchedTotal, setMatchedTotal] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  // ✅ Fetch the summary of today's transactions for the current cashier.
  const loadSummary = async () => {
    try {
      console.log("🔍 Fetching matching summary...");
      const { data } = await axios.get(
        `http://localhost:3001/api/cash-matching/matching-summary`,
        {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
          },
        }
      );
      console.log("✅ Summary loaded:", data);
      setMatchingSummary(data);
    } catch (err) {
      console.error("❌ Failed to load summary:", err);
    }
  };

  // ✅ Fetch the expected balance for today based on cashier transactions.
  const loadMatchedTotal = async () => {
    try {
      console.log("🔍 Fetching matched total...");
      const { data } = await axios.get(
        `http://localhost:3001/api/cash-deliveries/matched-total`,
        {
          params: {
            user_id: user.id,
            branch_id: user.branch_id,
            date: today,
          },
        }
      );
      console.log("✅ Matched total:", data);
      setMatchedTotal(data);
    } catch (err) {
      console.error("❌ Failed to fetch matched total:", err);
    }
  };

  useEffect(() => {
    loadSummary();
    loadMatchedTotal();
  }, []);

  const handleStartMatching = () => {
    if (!matchedTotal?.expected_balance) return;

    navigate("/matching/form", {
      state: {
        fromSummary: true,
        summary: matchingSummary,
        amount: parseFloat(matchedTotal.expected_balance),
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">مطابقة الكاشير - ملخص اليوم</h2>

      <MatchingSummaryTable summary={matchingSummary} />

      {matchedTotal?.expected_balance && (
        <div className="mt-6 text-green-700 text-sm font-bold">
          الرصيد المطابق لهذا اليوم:{" "}
          {parseFloat(matchedTotal.expected_balance).toLocaleString()} د.أ
        </div>
      )}

      <div className="mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleStartMatching}
        >
          بدء المطابقة
        </button>
      </div>
    </div>
  );
}
