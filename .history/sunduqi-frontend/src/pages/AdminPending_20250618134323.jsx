import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";

export default function AdminPending() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/cash-deliveries/pending");
      setPending(res.data || []);
    } catch (err) {
      toast.error("فشل في جلب السندات المتأخرة");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderDelivery = (delivery) => (
    <div
      key={delivery.id}
      className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200"
    >
      <div className="text-sm text-gray-500 mb-1">رقم السند: {delivery.delivery_number}</div>
      <div>المستخدم: <span className="font-semibold">{delivery.user?.full_name}</span></div>
      <div>الفرع: <span className="font-semibold">{delivery.branch?.name_ar}</span></div>
      <div>التاريخ: {formatDateTime(delivery.date)}</div>
      <div>المبلغ المسلم: <span className="font-bold text-blue-700">{parseFloat(delivery.delivered_amount).toFixed(2)} دينار</span></div>
      <div>ملاحظات: <span className="text-gray-700">{delivery.notes || "—"}</span></div>
      {delivery.is_closed_only && (
        <div className="text-sm text-red-600 mt-1">📦 تم إغلاق الصندوق فقط</div>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">السندات المتأخرة</h2>
      {loading ? (
        <div className="text-gray-600">جاري التحميل...</div>
      ) : pending.length === 0 ? (
        <div className="text-green-600">لا يوجد سندات متأخرة 🎉</div>
      ) : (
        pending.map((delivery) => renderDelivery(delivery))
      )}
    </div>
  );
}
