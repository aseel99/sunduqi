import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import logo from '../assets/eshalabi-logo.png';

const navLinks = [
  { path: '/', name: 'الرئيسية', icon: '🏠', allowedRoles: ['admin', 'casher'] },
  { path: '/opening', name: 'افتتاح الكاش', icon: '💰', allowedRoles: ['casher'] },
  { path: '/vouchers', name: 'إنشاء سند', icon: '🧾', allowedRoles: ['casher'] },
  { path: '/cash-delivery', name: 'تسليم الكاش', icon: '📦', allowedRoles: ['casher'] },
  { path: '/matching', name: 'مطابقة الصندوق', icon: '✅', allowedRoles: ['casher'] },
  { path: '/notifications', name: 'الإشعارات', icon: '🔔', allowedRoles: ['admin', 'casher'] },
  { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', allowedRoles: ['admin'] },
  { path: '/admin/vouchers', name: 'سندات الفروع', icon: '📋', allowedRoles: ['admin'], group: 'تفاصيل الكاش' },
  { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', allowedRoles: ['admin'], group: 'تفاصيل الكاش' },
  { path: '/admin/finance-summary', name: 'ملخص المقبوضات والمصروفات', icon: '📊', allowedRoles: ['admin'], group: 'تفاصيل الكاش' },
  { path: '/admin/summary', name: 'ترحيل للبنك', icon: '💳', allowedRoles: ['admin'], group: 'تفاصيل الكاش' },
  { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', allowedRoles: ['admin'] },
  { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', allowedRoles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) fetchUnreadNotifications();
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadNotifications(res.data.count);
    } catch (err) {
      console.error('Error fetching notifications count');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const isActive = (path) => location.pathname.startsWith(path);
  const grouped = navLinks.reduce((acc, link) => {
    if (!link.allowedRoles.includes(user?.role)) return acc;
    if (link.group) {
      acc[link.group] = acc[link.group] || [];
      acc[link.group].push(link);
    } else {
      acc[link.name] = [link];
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-graylight text-secondary font-arabic">
      <div className="md:flex">
        <aside className={`bg-white md:w-64 p-4 shadow-card md:min-h-screen fixed md:static z-40 top-0 right-0 h-full overflow-y-auto ${mobileOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="شعار" className="h-10" />
              <span className="text-xl font-bold text-primary">صندوقي</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-2xl">✖</button>
          </div>

          <nav className="space-y-2 pb-10">
            {Object.entries(grouped).map(([group, links], idx) => (
              <div key={idx}>
                {group !== links[0].name && (
                  <div className="text-xs text-muted mt-4 mb-1 font-semibold">{group}</div>
                )}
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded hover:bg-primary hover:bg-opacity-10 ${isActive(link.path) ? 'bg-primary bg-opacity-10 text-primary font-semibold' : ''}`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                    {link.path === '/notifications' && unreadNotifications > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}

            <button onClick={handleLogout} className="text-danger hover:underline flex items-center gap-1 mt-4">
              <span className="text-xl">🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </nav>
        </aside>

        <div className="flex-1 md:ml-64 relative">
          <div className="md:hidden p-3 bg-white shadow flex justify-between items-center sticky top-0 z-30">
            <span className="text-primary font-bold">صندوقي</span>
            <button onClick={() => setMobileOpen(true)} className="text-2xl">☰</button>
          </div>

          <main className="p-4 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
