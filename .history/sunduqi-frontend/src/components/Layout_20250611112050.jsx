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
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 rtl:space-x-reverse">
            {filteredLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="ml-2">{link.icon}</span>
                {link.name}
                {link.badge > 0 && (
                  <span className="ml-2 text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold">{user?.full_name}</div>
              <div className="text-xs text-gray-500">{user?.role === 'admin' ? 'مدير' : 'كاشير'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition"
            >
              <svg className="h-5 w-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              تسجيل خروج
            </button>
          </div>
        </div>

        {/* Full Screen Mobile Menu */}
        <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <span className="text-lg font-semibold">القائمة</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-red-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor">
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
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 transition-all duration-200 ease-in-out">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        نظام صندوقي - جميع الحقوق محفوظة © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
