import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', name: 'الرئيسية', icon: '🏠', allowedRoles: ['admin', 'casher'] },
    { path: '/opening', name: 'افتتاح الكاش', icon: '💰', allowedRoles: ['casher'] },
    { path: '/vouchers', name: 'إنشاء سند', icon: '🧾', allowedRoles: ['casher'] },
    { path: '/cash-delivery', name: 'تسليم الكاش', icon: '📦', allowedRoles: ['casher'] },
    { path: '/matching', name: 'مطابقة الصندوق', icon: '✅', allowedRoles: ['casher'] },
    { path: '/notifications', name: 'الإشعارات', icon: '🔔', allowedRoles: ['admin', 'casher'], badge: unreadNotifications },
    { path: '/admin/vouchers', name: 'سندات الفروع', icon: '📋', allowedRoles: ['admin'] },
    { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', allowedRoles: ['admin'] },
    { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', allowedRoles: ['admin'] },
    { path: '/admin/finance-summary', name: 'ملخص المقبوضات والمصروفات', icon: '📊', allowedRoles: ['admin'] },
    { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', allowedRoles: ['admin'] },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', allowedRoles: ['admin'] },
    { path: '/admin/summary', name: ' ترحيل للبنك', icon: '💳', allowedRoles: ['admin'] },
  ];

  const filteredLinks = navLinks.filter(link =>
    link.allowedRoles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 font-tajawal flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0 z-40 shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 rounded-md text-sm font-medium flex items-center transition-all ${
                isActive(link.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="ml-2">{link.icon}</span>
              {link.name}
              {link.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t text-sm text-center text-gray-500">
          صندوقي © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <span className="text-lg font-bold">القائمة</span>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg className="h-6 w-6 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-md text-base font-medium flex items-center ${
                isActive(link.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="ml-2">{link.icon}</span>
              {link.name}
              {link.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center md:hidden shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-700 hover:text-blue-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm font-semibold">{user?.full_name}</div>
        </header>

        <main className="p-4 md:p-6 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
