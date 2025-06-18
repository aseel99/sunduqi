import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import logo from '../assets/eshalabi-logo.png';
import { BASE_FILE_URL } from '../api/axios';


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
    <div className="font-[Tajawal] bg-white p-4 print:p-0 print:bg-white" dir="rtl">
      <div className="max-w-3xl mx-auto border border-gray-300 rounded-xl shadow-md p-6 print:p-8 print:shadow-none print:border print:max-w-full">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A237E] pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A237E]"> متجر الشلبي</h1>
            <p className="text-sm text-[#cbaa0f]">www.eshalabi.ps</p>
          </div>
          <img src={logo} alt="شعار الشلبي" className="w-20 h-20 object-contain" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-6 text-[#1A237E]">
          {isReceipt ? 'سند قبض' : 'سند صرف'}
        </h2>

        {/* Content */}
        <div className="space-y-4 text-sm text-gray-800 leading-6 border rounded-md p-4">

          <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            <div><strong>رقم السند:</strong> {voucher.id}</div>
            <div><strong>الفرع:</strong> {voucher.branch?.name_ar || voucher.branch_name}</div>
            <div><strong>اسم المستلم:</strong> {voucher.user?.full_name || voucher.user_name}</div>
            <div><strong>المبلغ:</strong> {Number(voucher.amount).toFixed(2)} دينار</div>
            <div><strong>طريقة الدفع:</strong> {voucher.payment_method === 'cash' ? 'نقداً' : 'بطاقة إلكترونية'}</div>
            <div><strong>تاريخ السند:</strong> {new Date(voucher.created_at).toLocaleDateString('ar-EG')}</div>
          </div>

          <hr className="border-t my-2" />

          {isReceipt && voucher.client_name && (
            <div><strong>اسم العميل:</strong> {voucher.client_name}</div>
          )}
          {!isReceipt && voucher.recipient_name && (
            <div><strong>اسم المستفيد:</strong> {voucher.recipient_name}</div>
          )}

          <div><strong>البيان:</strong> {voucher.notes || '—'}</div>

          {voucher.attachment_url && (
            <div>
              <strong>مرفق:</strong>{' '}
              <a href={voucher.attachment_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">عرض الملف</a>
            </div>
          )}
        </div>

        {/* Signature Area */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-sm text-gray-700 print:mt-16">
          <div className="text-center">
            <p>توقيع المحاسب</p>
            <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
          </div>
          <div className="text-center">
            <p>توقيع المستلم</p>
            <div className="mt-12 border-t border-gray-400 w-40 mx-auto" />
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-8 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full text-white py-2 rounded"
            style={{ backgroundColor: '#1A237E' }}
          >
            🖨️ طباعة السند
          </button>
        </div>
      </div>
    </div>
  );
}
