import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';

export default function VoucherDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isReceipt = location.pathname.includes('/receipt/');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        setError(null);
        let endpoint;
        if (isReceipt) endpoint = `/receipts/${id}`;
        else if (location.pathname.includes('/disbursement/')) endpoint = `/disbursements/${id}`;
        else throw new Error('Invalid voucher type');

        const res = await axios.get(endpoint);
        setVoucher(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'فشل تحميل بيانات السند');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVoucher();
  }, [id]);

  if (loading) return <div className="text-center mt-10 font-[Tajawal]">⏳ جاري التحميل...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 font-[Tajawal]">{error}</div>;
  if (!voucher) return <div className="text-center mt-10 text-red-500 font-[Tajawal]">⚠️ لم يتم العثور على السند</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white border border-gray-300 rounded-xl shadow-md p-6 print:shadow-none print:border-0 print:p-0 print:bg-white">
        {/* الترويسة */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4 print:border-none">
          <div>
            <h1 className="text-xl font-bold text-blue-900">مركز الصندوقي المالي</h1>
            <p className="text-sm text-gray-500">www.sunduqi.ps</p>
          </div>
          <img src="/logo.png" alt="شعار" className="w-20 h-20 object-contain print:hidden" />
        </div>

        {/* عنوان السند */}
        <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
          {isReceipt ? 'سند قبض' : 'سند صرف'}
        </h2>

        {/* بيانات السند */}
        <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-800 leading-6">
          <div><strong>رقم السند:</strong> {voucher.id}</div>
          <div><strong>الفرع:</strong> {voucher.branch?.name_ar || voucher.branch_name}</div>
          <div><strong>المستخدم:</strong> {voucher.user?.full_name || voucher.user_name}</div>
          <div><strong>المبلغ:</strong> ₪ {Number(voucher.amount).toFixed(2)}</div>
          <div><strong>طريقة الدفع:</strong> {voucher.payment_method === 'cash' ? 'نقداً' : 'بطاقة'}</div>
          <div><strong>التاريخ:</strong> {new Date(voucher.created_at).toLocaleDateString('ar-EG')}</div>
          {isReceipt && voucher.client_name && (
            <div><strong>العميل:</strong> {voucher.client_name}</div>
          )}
          {!isReceipt && voucher.recipient_name && (
            <div><strong>المستلم:</strong> {voucher.recipient_name}</div>
          )}
          <div className="col-span-2"><strong>البيان:</strong> {voucher.notes || '—'}</div>
          {voucher.attachment_url && (
            <div className="col-span-2">
              <strong>المرفق:</strong>{' '}
              <a href={voucher.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">عرض</a>
            </div>
          )}
        </div>

        {/* التوقيع */}
        <div className="mt-10 border-t border-gray-300 pt-6 print:pt-10">
          <div className="flex justify-between text-sm text-gray-700">
            <div className="text-center">
              <div>توقيع المحاسب</div>
              <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
            </div>
            <div className="text-center">
              <div>توقيع المستلم</div>
              <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
            </div>
          </div>
        </div>

        {/* زر الطباعة */}
        <button
          onClick={() => window.print()}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded print:hidden"
        >
          طباعة السند 🖨️
        </button>
      </div>
    </div>
  );
}
