import { useNavigate } from 'react-router-dom';

export default function ChooseVoucher() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-right p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          اختر نوع السند
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/receipt')}
            className="bg-green-600 text-white py-3 rounded hover:bg-green-700"
          >
            🧾 سند قبض
          </button>

          <button
            onClick={() => navigate('/disbursement')}
            className="bg-red-600 text-white py-3 rounded hover:bg-red-700"
          >
            💸 سند صرف
          </button>
        </div>
      </div>
    </div>
  );
}
