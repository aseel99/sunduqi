import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import logo from '../assets/eshalabi-logo.png';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

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
    {
      name: 'تفاصيل الكاش والسندات',
      icon: '📂',
      type: 'submenu',
      allowedRoles: ['admin'],
      children: [
        { path: '/admin/finance-summary', name: 'ملخص المقبوضات والمصروفات', icon: '📊' },
        { path: '/admin/vouchers', name: 'السندات', icon: '📋' },
        { path: '/admin/summary', name: 'ترحيل للبنك', icon: '💳' },
      ],
    },
    { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', allowedRoles: ['admin'] },
    { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', allowedRoles: ['admin'] },
    { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', allowedRoles: ['admin'] },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', allowedRoles: ['admin'] },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.allowedRoles?.includes(user?.role)) return true;
    if (link.type === 'submenu') return link.allowedRoles.includes(user?.role);
    return false;
  });

  const renderLink = (link, isMobile = false) => (
    <Link
      key={link.path}
      to={link.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
        isActive(link.path)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
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
    <div className="space-y-1">
      <button
        onClick={() => setSubmenuOpen(!submenuOpen)}
        className={`flex w-full items-center justify-between px-4 py-2 rounded-md font-medium transition-all ${
          submenuOpen ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        } ${isMobile ? 'text-base' : 'text-sm'}`}
      >
        <span className="flex items-center">
          <span className="ml-2">📂</span> تفاصيل الكاش والسندات
        </span>
        <svg className={`h-4 w-4 transform transition-transform ${submenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {submenuOpen && (
        <div className="pl-6 space-y-1">
          {navLinks.find(link => link.type === 'submenu').children.map(child =>
            renderLink(child, isMobile)
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 font-tajawal flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-center h-20 border-b px-4">
          <img src={logo} alt="شعار صندوقي" className="h-10 w-auto mr-2" />
          <span className="text-xl font-bold text-blue-700">صندوقي</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredLinks.map(link =>
            link.type === 'submenu'
              ? renderSubmenu(false)
              : renderLink(link, false)
          )}
        </div>
        <div className="p-4 border-t text-sm text-center text-gray-500">
          صندوقي © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center">
            <img src={logo} alt="شعار صندوقي" className="h-8 w-auto mr-2" />
            <span className="text-lg font-bold text-blue-700">صندوقي</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg className="h-6 w-6 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {filteredLinks.map(link =>
            link.type === 'submenu'
              ? renderSubmenu(true)
              : renderLink(link, true)
          )}
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
