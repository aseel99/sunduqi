import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios.get('/notifications')
      .then((res) => {
        setNotifications(res.data.data); // res.data.data holds the array of notifications
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h2 className="text-2xl font-bold mb-4">الإشعارات</h2>
      <div className="space-y-4">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white p-4 shadow rounded border-r-4"
              style={{
                borderColor:
                  n.priority === 1 ? '#dc2626' : n.priority === 2 ? '#f59e0b' : '#16a34a',
              }}
            >
              <div className="font-bold">{n.title}</div>
              <div>{n.message}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">لا إشعارات حالياً</div>
        )}
      </div>
    </div>
  );
}
