import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

function Layout() {
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
    } catch {
      console.error('فشل في جلب عدد الإشعارات');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', name: 'رئيسية الإدارة' },
    { path: '/products', name: 'المنتجات' },
    { path: '/orders', name: 'الطلبات', badge: 17 },
    { path: '/discounts', name: 'كوبونات الخصم' },
    { path: '/delivery', name: 'شركات التوصيل' },
    { path: '/sales', name: 'نقاط المبيعات' },
    { path: '/accounts', name: 'حسابات التجار' },
    { path: '/reports', name: 'تقارير المبيعات' },
    { path: '/categories', name: 'التصنيفات' },
    { path: '/marketing', name: 'التسويق الإلكتروني' },
    { path: '/branches', name: 'الفروع والمخازن' },
    { path: '/cities', name: 'قائمة المدن' },
  ];

  const renderLink = (link) => {
    const active = isActive(link.path);
    return (
      <Link
        key={link.path}
        to={link.path}
        className={`flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition
          ${active ? 'bg-yellow-400 text-black shadow' : 'text-white hover:bg-[#017187]'}`}
      >
        <span>{link.name}</span>
        {link.badge && (
          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
            {link.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f4f4f4] font-[Tajawal]" dir="rtl">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#02657C] text-white shadow-lg">
        {/* User Header */}
        <div className="bg-yellow-400 text-black text-center py-4">
          <div className="text-lg font-bold">{user?.full_name || 'اسم المستخدم'}</div>
          <div className="text-xs font-semibold">{new Date().toLocaleDateString('ar-EG')}</div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map(renderLink)}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-cyan-800 text-sm">
          <button onClick={handleLogout} className="w-full flex items-center justify-center hover:text-red-500">
            <span className="ml-2">🚪</span> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-[#02657C] z-50 md:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 bg-yellow-400 text-black">
          <div className="text-xl font-bold">{user?.full_name || 'صندوقي'}</div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navLinks.map(renderLink)}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-white mt-4 hover:text-red-400"
          >
            <span className="ml-2">🚪</span> تسجيل خروج
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow p-4 flex justify-between items-center">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600" title="Log out">
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="p-4 md:p-6 flex-grow bg-white m-4 rounded-md shadow-[0_0_12px_#ccc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
