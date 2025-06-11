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
        
        // Determine the endpoint based on the current path
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
        setError(err.response?.data?.message || 'Failed to load voucher');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoucher();
    }
  }, [id, location.pathname]);

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!voucher) return <div className="text-center mt-10 text-red-500">لم يتم العثور على السند</div>;

  // Determine voucher type for display purposes
  const isReceipt = location.pathname.includes('/receipt/');

  return (
    <div className="min-h-screen bg-white p-6 text-right print:bg-white">
      <div className="max-w-md mx-auto border border-gray-300 p-6 rounded-lg shadow text-sm print:shadow-none">
        <h2 className="text-xl font-bold text-center mb-4">
          {isReceipt ? 'سند قبض' : 'سند صرف'}
        </h2>

        {/* Common fields */}
        <div className="mb-2">رقم السند: {voucher.id}</div>
        <div className="mb-2">الفرع: {voucher.branch?.name_ar || voucher.branch_name}</div>
        <div className="mb-2">المستخدم: {voucher.user?.full_name || voucher.user_name}</div>
        <div className="mb-2">المبلغ: {voucher.amount} د.أ</div>
        <div className="mb-2">طريقة الدفع: {voucher.payment_method === 'cash' ? 'كاش' : 'فيزا'}</div>
        <div className="mb-2">البيان: {voucher.notes || '-'}</div>
        <div className="mb-2">تاريخ الإدخال: {new Date(voucher.created_at).toLocaleDateString()}</div>

        {/* Receipt-specific field */}
        {isReceipt && voucher.client_name && (
          <div className="mb-2">اسم العميل: {voucher.client_name}</div>
        )}

        {/* Disbursement-specific field */}
        {!isReceipt && voucher.recipient_name && (
          <div className="mb-2">اسم المستلم: {voucher.recipient_name}</div>
        )}

        {voucher.attachment_url && (
          <div className="mb-2">
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

        <button
          onClick={() => window.print()}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 print:hidden"
        >
          طباعة السند
        </button>
      </div>
    </div>
  );
}