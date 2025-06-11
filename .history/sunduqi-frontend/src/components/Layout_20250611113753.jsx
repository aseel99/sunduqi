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
    } catch { console.error('Fetching notifications failed'); }
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
    { type: 'submenu', name: 'تفاصيل الكاش والسندات', icon: '📂', roles: ['admin'], children: submenuLinks },
    { path: '/admin/collection', name: 'استلام الكاش', icon: '🏦', roles: ['admin'] },
    { path: '/admin/matching', name: 'مطابقة الصندوق', icon: '🧮', roles: ['admin'] },
    { path: '/admin/pending', name: 'السندات المتأخرة', icon: '⏳', roles: ['admin'] },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: '👥', roles: ['admin'] },
  ];

  const filteredLinks = navLinks.filter(l => l.roles?.includes(user?.role));

  const isSubmenuActive = submenuLinks.some(l => isActive(l.path));
  useEffect(() => { if (isSubmenuActive) setSubmenuOpen(true); }, [location]);

  const renderLink = (l, mobile = false) => (
    <Link
      key={l.path}
      to={l.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center px-4 py-2 rounded-md font-medium ${
        isActive(l.path)
          ? 'bg-[var(--color-accent)] text-[var(--color-text)]'
          : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
      } ${mobile ? 'text-base' : 'text-sm'}`}
    >
      <span className="ml-2">{l.icon}</span> {l.name}
      {l.badge > 0 && (
        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
          {l.badge}
        </span>
      )}
    </Link>
  );

  const renderSubmenu = (mobile = false) => (
    <div className="space-y-1">
      <button
        onClick={() => setSubmenuOpen(!submenuOpen)}
        className={`flex justify-between items-center w-full px-4 py-2 rounded-md font-medium ${
          submenuOpen ? 'bg-[var(--color-accent)] text-[var(--color-text)]' : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
        } ${mobile ? 'text-base' : 'text-sm'}`}
      >
        <span className="flex items-center"><span className="ml-2">📂</span> تفاصيل الكاش والسندات</span>
        <svg className={`h-4 w-4 transition-transform ${submenuOpen ? 'rotate-180' : ''}`} stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {submenuOpen && (
        <div className="pl-6 space-y-1">
          {submenuLinks.map(child => renderLink(child, mobile))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex font-[Tajawal] bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-bg)] border-r shadow-lg">
        <div className="flex items-center justify-center h-20 bg-[var(--color-accent)] border-b px-4">
          <img src={logo} alt="صندوقي" className="h-10 mr-2 w-auto" />
          <span className="text-xl font-bold">صندوقي</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredLinks.map(l => (l.type === 'submenu' ? renderSubmenu(false) : renderLink(l, false)))}
        </div>
        <div className="p-4 border-t text-center text-xs text-gray-500">
          صندوقي © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[var(--color-bg)] z-50 transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center px-4 py-4 bg-[var(--color-accent)] border-b">
          <div className="flex items-center">
            <img src={logo} alt="صندوقي" className="h-8 mr-2 w-auto" />
            <span className="text-lg font-bold">صندوقي</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            ✖️
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {filteredLinks.map(l => (l.type === 'submenu' ? renderSubmenu(true) : renderLink(l, true)))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between bg-[var(--color-bg)] p-4 border-b shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)}>☰</button>
          <span className="font-medium">{user?.full_name}</span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
