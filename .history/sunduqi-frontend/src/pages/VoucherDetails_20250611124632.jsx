import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';

export default function VoucherDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint;
        if (location.pathname.includes('/receipt/')) {
          endpoint = `/receipts/${id}`;
        } else if (location.pathname.includes('/disbursement/')) {
          endpoint = `/disbursements/${id}`;
        } else {
          throw new Error('Invalid voucher type');
        }

        const res = await axios.get(endpoint);
        setVoucher(res.data);
      } catch (err) {
        console.error('Failed to fetch voucher:', err);
        setError(err.response?.data?.message || 'فشل تحميل بيانات السند');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVoucher();
  }, [id, location.pathname]);

  if (loading) return <div className="text-center mt-10 font-[Tajawal]">⏳ جاري التحميل...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 font-[Tajawal]">{error}</div>;
  if (!voucher) return <div className="text-center mt-10 text-red-500 font-[Tajawal]">⚠️ لم يتم العثور على السند</div>;

  const isReceipt = location.pathname.includes('/receipt/');

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-md mx-auto bg-white border border-gray-300 rounded-xl shadow-md p-6 text-sm print:bg-white print:shadow-none print:border-0">
        <h2 className="text-xl font-bold text-center mb-6 text-blue-700">
          {isReceipt ? 'سند قبض' : 'سند صرف'}
        </h2>

        <div className="space-y-2 text-gray-700">
          <div><strong>رقم السند:</strong> {voucher.id}</div>
          <div><strong>الفرع:</strong> {voucher.branch?.name_ar || voucher.branch_name}</div>
          <div><strong>المستخدم:</strong> {voucher.user?.full_name || voucher.user_name}</div>
          <div><strong>المبلغ:</strong> ₪ {Number(voucher.amount).toFixed(2)}</div>
          <div><strong>طريقة الدفع:</strong> {voucher.payment_method === 'cash' ? 'كاش' : 'فيزا'}</div>
          <div><strong>البيان:</strong> {voucher.notes || '-'}</div>
          <div><strong>تاريخ الإدخال:</strong> {new Date(voucher.created_at).toLocaleDateString('en-GB')}</div>

          {isReceipt && voucher.client_name && (
            <div><strong>اسم العميل:</strong> {voucher.client_name}</div>
          )}

          {!isReceipt && voucher.recipient_name && (
            <div><strong>اسم المستلم:</strong> {voucher.recipient_name}</div>
          )}

          {voucher.attachment_url && (
            <div>
              <strong>المرفق:</strong>{' '}
              <a
                href={voucher.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                عرض المرفق
              </a>
            </div>
          )}
        </div>

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
