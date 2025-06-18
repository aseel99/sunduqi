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
    { path: '/', name: 'الرئيسية', icon: '🏠', roles: ['admin', 'casher'], group: 'عام' },
    { path: '/opening', name: 'افتتاح الكاش', icon: '💰', roles: ['casher'], group: 'الكاشير' },
    { path: '/vouchers', name: 'إنشاء سند', icon: '🧾', roles: ['casher'], group: 'الكاشير' },
    { path: '/cash-delivery', name: 'تسليم الكاش', icon: '📦', roles: ['casher'], group: 'الكاشير' },
    { path: '/matching', name: 'مطابقة الصندوق', icon: '✅', roles: ['casher'], group: 'الكاشير' },
    { path: '/notifications', name: 'الإشعارات', icon: '🔔', roles: ['admin', 'casher'], badge: unreadNotifications, group: 'عام' },
    {
      type: 'submenu',
      name: 'تفاصيل الكاش والسندات',
      icon: '📂',
      roles: ['admin'],
      children: submenuLinks,
      group: 'الإدارة'
    },
    { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', roles: ['admin'], group: 'الإدارة' },
    { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', roles: ['admin'], group: 'الإدارة' },
    { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', roles: ['admin'], group: 'الإدارة' },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', roles: ['admin'], group: 'الإدارة' },
  ];

  const filteredGroups = [...new Set(navLinks.filter(link => (link.roles || []).includes(user?.role)).map(link => link.group))];

  const renderLink = (link, isMobile = false) => (
    <Link
      key={link.path}
      to={link.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded transition text-white ${
        isActive(link.path) ? 'bg-yellow-300 text-black font-bold' : 'hover:bg-[#01627c]'
      } ${isMobile ? 'text-base' : 'text-sm'}`}
    >
      <span>{link.icon}</span>
      {link.name}
      {link.badge > 0 && (
        <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{link.badge}</span>
      )}
    </Link>
  );

  const renderSubmenu = (isMobile = false) => (
    <div key="submenu" className="space-y-1">
      <button
        onClick={() => setSubmenuOpen(!submenuOpen)}
        className={`flex items-center w-full justify-between px-4 py-2 rounded transition text-white ${
          submenuOpen ? 'bg-yellow-300 text-black font-bold' : 'hover:bg-[#01627c]'
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
    <div className="min-h-screen flex bg-[#f4f4f4] font-[Tajawal]" dir="rtl">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#01475b] text-white">
        <div className="bg-yellow-400 text-black text-center py-5">
          <img src={logo} alt="صندوقي" className="h-10 w-auto mx-auto mb-1" />
          <div className="text-lg font-bold">صندوقي</div>
          <div className="text-xs">نظام إدارة الكاش</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map(group => (
            <div key={group} className="mt-2">
              <div className="text-xs font-bold text-white px-4 py-1 opacity-70">{group}</div>
              <div className="space-y-1">
                {navLinks
                  .filter(link => link.group === group && (link.roles || []).includes(user?.role))
                  .map(link => link.type === 'submenu' ? renderSubmenu(false) : renderLink(link, false))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center text-sm hover:text-red-400">
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow">
          <button onClick={() => setMobileMenuOpen(true)} className="text-[#1c1c1c]">
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600" title="Log out">
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-grow bg-white rounded-md shadow-[0_0_12px_#ccc] m-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
