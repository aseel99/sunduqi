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

  const navLinks = [
    { label: 'الرئيسية', icon: '🏠', to: '/' },
    { label: 'الإشعارات', icon: '🔔', to: '/notifications' },
    {
      label: 'تفاصيل الكاش والسندات',
      icon: '📁',
      submenu: [
        { label: 'استلام الكاش', icon: '🏦', to: '/cash-receipts' },
        { label: 'مطابقة الصندوق', icon: '🧾', to: '/reconciliation' },
        { label: 'السندات المتأخرة', icon: '⏳', to: '/late-receipts' },
      ],
    },
    { label: 'إدارة المستخدمين', icon: '👥', to: '/users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className={`bg-darkBlue text-white w-64 p-4 space-y-4 hidden md:block`}>
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <h2 className="text-lg font-bold text-center mb-4">صندوقي</h2>
        <nav className="space-y-2">
          {navLinks.map((item, idx) => (
            item.submenu ? (
              <div key={idx}>
                <button
                  onClick={() => setSubmenuOpen(!submenuOpen)}
                  className="w-full text-right flex justify-between items-center py-2 px-4 rounded hover:bg-primary/80 transition"
                >
                  <span>{item.icon} {item.label}</span>
                  <span>{submenuOpen ? '▲' : '▼'}</span>
                </button>
                {submenuOpen && (
                  <div className="pl-6 mt-1 space-y-2">
                    {item.submenu.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.to}
                        className="block text-sm hover:text-accent transition"
                      >
                        {sub.icon} {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={idx}
                to={item.to}
                className={`block py-2 px-4 rounded hover:bg-primary/80 transition ${
                  location.pathname === item.to ? 'bg-primary/90' : ''
                }`}
              >
                {item.icon} {item.label}
              </Link>
            )
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="text-sm mt-8 flex items-center justify-center text-white hover:text-red-300"
        >
          ← تسجيل خروج
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-darkBlue text-white flex flex-col w-64 p-4">
          <button className="text-left mb-6" onClick={() => setMobileMenuOpen(false)}>✖️</button>
          <h2 className="text-xl font-bold mb-4">صندوقي</h2>
          {navLinks.map((item, idx) => (
            item.submenu ? (
              <div key={idx}>
                <button
                  onClick={() => setSubmenuOpen(!submenuOpen)}
                  className="w-full text-right flex justify-between items-center py-2 px-4 rounded hover:bg-primary/80 transition"
                >
                  <span>{item.icon} {item.label}</span>
                  <span>{submenuOpen ? '▲' : '▼'}</span>
                </button>
                {submenuOpen && (
                  <div className="pl-6 mt-1 space-y-2">
                    {item.submenu.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.to}
                        className="block text-sm hover:text-accent transition"
                      >
                        {sub.icon} {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={idx}
                to={item.to}
                className="block py-2 px-4 rounded hover:bg-primary/80 transition"
              >
                {item.icon} {item.label}
              </Link>
            )
          ))}
          <button
            onClick={handleLogout}
            className="mt-8 text-sm flex items-center justify-center text-white hover:text-red-300"
          >
            ← تسجيل خروج
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
