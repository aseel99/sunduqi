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
    if (user) {
      fetchUnreadNotifications();
    }
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
  { path: '/admin/finance-summary', name: 'ملخص المقبوضات والمصروفات', icon: '📊', allowedRoles: ['admin'] }, // ✅ جديد
  { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', allowedRoles: ['admin'] },
  { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', allowedRoles: ['admin'] },
  { path: '/admin/summary', name: ' ترحيل للبنك', icon: '💳', allowedRoles: ['admin'] },
];


  const filteredLinks = navLinks.filter(link =>
    link.allowedRoles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4 rtl:space-x-reverse">
                  {filteredLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        isActive(link.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="ml-1">{link.icon}</span>
                      {link.name}
                      {link.badge > 0 && (
                        <span className="mr-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <Link
                    to="/notifications"
                    className="p-1 rounded-full text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <span className="sr-only">الإشعارات</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 inline-block w-4 h-4 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="mr-3 text-right">
                  <div className="text-sm font-medium text-gray-800">{user?.full_name}</div>
                  <div className="text-xs text-gray-500">{user?.role === 'admin' ? 'مدير' : 'كاشير'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center"
                >
                  <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  تسجيل خروج
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="ml-2">{link.icon}</span>
                {link.name}
                {link.badge > 0 && (
                  <span className="mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6">
        <Outlet /> {/* 🧩 This is where child routes will be rendered */}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          نظام صندوقي - جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
