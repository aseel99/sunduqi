import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import { BellIcon, LogOutIcon } from 'lucide-react';
import logo from '../assets/eshalabi-logo.png'; // تأكد أن هذا هو مسار اللوجو الجديد

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleNotifications = () => setShowNotifications(prev => !prev);

  return (
    <div className="min-h-screen bg-graylight text-secondary font-arabic">
      <div className="flex flex-col md:flex-row">
        {/* القائمة الجانبية */}
        <aside className="w-full md:w-64 bg-white shadow-card p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <img src={logo} alt="شعار" className="h-10 inline-block" />
              <span className="ml-2 text-xl font-bold text-primary">صندوقي</span>
            </Link>
            <button onClick={toggleNotifications} className="relative">
              <BellIcon className="w-5 h-5 text-secondary" />
              {/* يمكن لاحقاً إضافة عداد */}
            </button>
          </div>

          {/* قائمة التنقل */}
          <nav className="space-y-1">
            {user.role === 'casher' && (
              <>
                <NavItem to="/opening" label="فتح الكاش" active={isActive('/opening')} />
                <NavItem to="/receipt" label="سند قبض" active={isActive('/receipt')} />
                <NavItem to="/disbursement" label="سند صرف" active={isActive('/disbursement')} />
                <NavItem to="/delivery" label="تسليم الكاش" active={isActive('/delivery')} />
                <NavItem to="/matching" label="مطابقة الكاش" active={isActive('/matching')} />
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavItem to="/admin/collection" label="استلام الكاش" active={isActive('/admin/collection')} />
                <NavItem to="/admin/details" label="تفاصيل الكاش" active={isActive('/admin/details')} />
                <NavItem to="/admin/pending" label="السندات المتأخرة" active={isActive('/admin/pending')} />
              </>
            )}

            <button onClick={logout} className="text-danger hover:underline flex items-center gap-1 mt-4">
              <LogOutIcon className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </nav>

          {/* قائمة الإشعارات الثانوية */}
          {showNotifications && (
            <div className="mt-4 p-3 bg-white border rounded shadow-card">
              <p className="text-sm text-muted">لا توجد إشعارات حالياً</p>
              {/* يمكن ربطها ببيانات حقيقية لاحقاً */}
            </div>
          )}
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded hover:bg-primary hover:bg-opacity-10 ${active ? 'bg-primary bg-opacity-10 text-primary font-semibold' : ''}`}
    >
      {label}
    </Link>
  );
}
