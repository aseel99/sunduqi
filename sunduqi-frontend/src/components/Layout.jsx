import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import logo from '../assets/eshalabi-logo.png';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  // تحميل عدد الإشعارات
  useEffect(() => {
    if (user) fetchUnreadNotifications();
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadNotifications(res.data.count);
    } catch {
      console.error('فشل في تحميل الإشعارات');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const isActive = (path) => location.pathname === path;

  const submenuLinks = [
    { path: '/admin/finance-summary', name: 'ملخص المقبوضات والمصروفات', icon: '📊' },
    { path: '/admin/vouchers', name: 'السندات', icon: '📋' },
    { path: '/admin/summary', name: 'ترحيل للبنك', icon: '💳' },
  ];

  const navLinks = [
    { path: '/', name: 'الرئيسية', icon: '🏠', roles: ['admin', 'casher'] },
    { path: '/opening', name: 'افتتاح الكاش', icon: '💰', roles: ['casher'] },
    { path: '/vouchers', name: 'إنشاء سند', icon: '🧾', roles: ['casher'] },
    { path: '/cash-delivery', name: 'تسليم الكاش', icon: '📦', roles: ['casher'] },
    { path: '/matching', name: 'مطابقة الصندوق', icon: '✅', roles: ['casher'] },
    { path: '/notifications', name: 'الإشعارات', icon: '🔔', roles: ['admin', 'casher'], badge: unreadNotifications },
    {
      type: 'submenu',
      name: 'تفاصيل الكاش والسندات',
      icon: '📂',
      roles: ['admin'],
      children: submenuLinks,
    },
    { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', roles: ['admin'] },
    { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', roles: ['admin'] },
    { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', roles: ['admin'] },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', roles: ['admin'] },
  ];

  // تصفية حسب الدور
  const filteredLinks = navLinks.filter(link => {
    if (link.roles) return link.roles.includes(user?.role);
    if (link.type === 'submenu') return link.roles?.includes(user?.role);
    return false;
  });

  const isSubmenuActive = submenuLinks.some(link => isActive(link.path));
  useEffect(() => {
    if (isSubmenuActive) setSubmenuOpen(true);
  }, [location]);

  const renderLink = (link, isMobile = false) => (
    <Link
      key={link.path}
      to={link.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center px-4 py-2 rounded-md font-medium ${
        isActive(link.path)
          ? 'bg-yellow-200 text-gray-900'
          : 'text-gray-800 hover:bg-gray-100'
      } ${isMobile ? 'text-base' : 'text-sm'}`}
    >
      <span className="ml-2">{link.icon}</span>
      {link.name}
      {link.badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {link.badge}
        </span>
      )}
    </Link>
  );

  const renderSubmenu = (isMobile = false) => (
    <div key="submenu" className="space-y-1">
      <button
        onClick={() => setSubmenuOpen(!submenuOpen)}
        className={`w-full flex justify-between items-center px-4 py-2 rounded-md font-medium ${
          submenuOpen ? 'bg-yellow-200 text-gray-900' : 'text-gray-800 hover:bg-gray-100'
        } ${isMobile ? 'text-base' : 'text-sm'}`}
      >
        <span className="flex items-center"><span className="ml-2">📂</span> تفاصيل الكاش والسندات</span>
        <svg className={`h-4 w-4 transform transition-transform ${submenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {submenuOpen && (
        <div className="pl-6 space-y-1">
          {submenuLinks.map(child => renderLink(child, isMobile))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Tajawal] flex" dir="rtl">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l shadow-sm">
        <div className="flex items-center justify-center h-20 border-b bg-yellow-400 px-4">
          <img src={logo} alt="صندوقي" className="h-10 w-auto ml-2" />
          <span className="text-xl font-bold">صندوقي</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredLinks.map(link =>
            link.type === 'submenu' ? renderSubmenu(false) : renderLink(link, false)
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-sm text-gray-700 hover:text-red-600"
          >
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b bg-yellow-400">
          <div className="flex items-center">
            <img src={logo} alt="شعار" className="h-8 w-auto ml-2" />
            <span className="text-lg font-bold text-gray-900">صندوقي</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {filteredLinks.map(link =>
            link.type === 'submenu' ? renderSubmenu(true) : renderLink(link, true)
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center mt-4 text-gray-700 hover:text-red-600"
          >
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            تسجيل خروج
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600"
              title="تسجيل الخروج"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
