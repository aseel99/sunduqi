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

  useEffect(() => {
    if (user) fetchUnreadNotifications();
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadNotifications(res.data.count);
    } catch {
      console.error('Failed to fetch unread notifications');
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

  const filteredLinks = navLinks.filter(link =>
    (link.roles && link.roles.includes(user?.role)) || (link.type === 'submenu' && link.roles?.includes(user?.role))
  );

  const isSubmenuActive = submenuLinks.some(link => isActive(link.path));
  useEffect(() => {
    if (isSubmenuActive) setSubmenuOpen(true);
  }, [location]);

  const renderLink = (link, isMobile = false) => (
    <Link
      key={link.path}
      to={link.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`sidebar-link ${isActive(link.path) ? 'sidebar-link-active' : ''} ${isMobile ? 'text-base' : 'text-sm'}`}
    >
      <span className="ml-2">{link.icon}</span>
      {link.name}
      {link.badge > 0 && <span className="badge">{link.badge}</span>}
    </Link>
  );

  const renderSubmenu = (isMobile = false) => (
    <div key="submenu" className="space-y-1">
      <button
        onClick={() => setSubmenuOpen(!submenuOpen)}
        className={`sidebar-link w-full justify-between ${submenuOpen ? 'sidebar-link-active' : ''} ${isMobile ? 'text-base' : 'text-sm'}`}
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
          {submenuLinks.map(child => renderLink(child, isMobile))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-lightgray text-darkgray font-arabic" dir="rtl">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white rounded-tr-xl rounded-br-xl shadow-md">
        <div className="sidebar-header">
          <img src={logo} alt="صندوقي" className="h-12 w-auto mx-auto mb-2" />
          <div className="text-xl font-bold">صندوقي</div>
          <div className="text-xs opacity-80">نظام إدارة الكاش</div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {filteredLinks.map(link => link.type === 'submenu' ? renderSubmenu(false) : renderLink(link, false))}
        </div>
        <div className="p-4 border-t border-borderGray">
          <button onClick={handleLogout} className="logout-button">
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 bg-primary text-white">
          <div className="flex items-center gap-2">
            <img src={logo} alt="شعار" className="h-8 w-auto" />
            <span className="text-lg font-bold">صندوقي</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="px-4 py-4 space-y-2">
          {filteredLinks.map(link => link.type === 'submenu' ? renderSubmenu(true) : renderLink(link, true))}
          <button onClick={handleLogout} className="logout-button mt-4">
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            تسجيل خروج
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="mobile-header">
          <button onClick={() => setMobileMenuOpen(true)} className="text-darkgray">
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <button onClick={handleLogout} className="text-darkgray hover:text-danger" title="Log out">
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
