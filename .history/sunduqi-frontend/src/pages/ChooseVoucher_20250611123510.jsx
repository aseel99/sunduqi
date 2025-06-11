import { useNavigate } from 'react-router-dom';

export default function ChooseVoucher() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-right p-6 font-[Tajawal]" dir="rtl">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-yellow-600 mb-8 text-center">
          اختر نوع السند
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/receipt')}
            className="bg-green-600 hover:bg-green-700 transition text-white py-3 text-lg rounded-md shadow-md flex items-center justify-center gap-2"
          >
            🧾 <span>سند قبض</span>
          </button>

          <button
            onClick={() => navigate('/disbursement')}
            className="bg-red-600 hover:bg-red-700 transition text-white py-3 text-lg rounded-md shadow-md flex items-center justify-center gap-2"
          >
            💸 <span>سند صرف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
