import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import logo from '../assets/eshalabi-logo.png';

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
        else throw new Error('نوع السند غير معروف');

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
    <div className="min-h-screen bg-white p-6 font-[Tajawal]" dir="rtl">
      <div className="max-w-3xl mx-auto border border-gray-300 rounded-xl shadow-md p-6 print:shadow-none print:border-0 print:p-0 print:bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:border-none">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">متاجر الشلبي</h1>
            <p className="text-sm text-gray-500">https://www.eshalabi.ps</p>
          </div>
          <img src={logo} alt="شعار الشلبي" className="w-20 h-20 object-contain print:w-16 print:h-16" />
        </div>

        {/* Voucher Type Title */}
        <h2 className="text-xl text-center font-bold text-blue-700 mb-6">
          {isReceipt ? 'سند قبض' : 'سند صرف'}
        </h2>

        {/* Voucher Info */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-800 leading-6">
          <div><strong>رقم السند:</strong> {voucher.id}</div>
          <div><strong>الفرع:</strong> {voucher.branch?.name_ar || voucher.branch_name}</div>
          <div><strong>المستخدم:</strong> {voucher.user?.full_name || voucher.user_name}</div>
          <div><strong>المبلغ:</strong> {Number(voucher.amount).toFixed(2)} ₪</div>
          <div><strong>طريقة الدفع:</strong> {voucher.payment_method === 'cash' ? 'نقداً' : 'بطاقة'}</div>
          <div><strong>التاريخ:</strong> {new Date(voucher.created_at).toLocaleDateString('ar-EG')}</div>
          {isReceipt && voucher.client_name && (
            <div className="col-span-2"><strong>اسم العميل:</strong> {voucher.client_name}</div>
          )}
          {!isReceipt && voucher.recipient_name && (
            <div className="col-span-2"><strong>اسم المستلم:</strong> {voucher.recipient_name}</div>
          )}
          <div className="col-span-2"><strong>البيان:</strong> {voucher.notes || '—'}</div>
          {voucher.attachment_url && (
            <div className="col-span-2">
              <strong>المرفق:</strong>{' '}
              <a href={voucher.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">عرض</a>
            </div>
          )}
        </div>

        {/* Signature Area */}
        <div className="mt-10 border-t pt-6 print:pt-10">
          <div className="flex justify-between text-sm text-gray-700">
            <div className="text-center">
              <p>توقيع المحاسب</p>
              <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
            </div>
            <div className="text-center">
              <p>توقيع المستلم</p>
              <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
            </div>
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="mt-8 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded print:hidden"
        >
          🖨️ طباعة السند
        </button>
      </div>
    </div>
  );
}
