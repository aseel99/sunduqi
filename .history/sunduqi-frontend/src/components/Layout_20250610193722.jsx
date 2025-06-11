import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b font-bold text-xl text-center">
          صندوقي 💰
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {user?.role === 'casher' && (
              <>
                <li>
                  <Link to="/opening" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧾 فتح الرصيد
                  </Link>
                </li>
                <li>
                  <Link to="/receipt" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📥 سند قبض
                  </Link>
                </li>
                <li>
                  <Link to="/disbursement" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📤 سند صرف
                  </Link>
                </li>
                <li>
                  <Link to="/delivery" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🚚 تسليم النقدية
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/vouchers" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📄 كل السندات
                  </Link>
                </li>
                <li>
                  <Link to="/admin/collection" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📦 استلام الكاش
                  </Link>
                </li>
                <li>
                  <Link to="/admin/pending" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🕒 السندات المتأخرة
                  </Link>
                </li>
                <li>
                  <Link to="/admin/matching" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧮 مطابقة المجاميع
                  </Link>
                </li>
                <li>
                  <Link to="/admin/summary" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    💳 ترحيل للبنك
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/notifications" className="block px-4 py-2 hover:bg-gray-200 rounded">
                🔔 الإشعارات
              </Link>
            </li>

            <li>
              <button
                onClick={logout}
                className="block w-full text-right px-4 py-2 hover:bg-red-100 text-red-600 rounded"
              >
                🚪 تسجيل الخروج
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b font-bold text-xl text-center">
          صندوقي 💰
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {user?.role === 'casher' && (
              <>
                <li>
                  <Link to="/opening" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧾 فتح الرصيد
                  </Link>
                </li>
                <li>
                  <Link to="/receipt" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📥 سند قبض
                  </Link>
                </li>
                <li>
                  <Link to="/disbursement" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📤 سند صرف
                  </Link>
                </li>
                <li>
                  <Link to="/delivery" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🚚 تسليم النقدية
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/vouchers" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📄 كل السندات
                  </Link>
                </li>
                <li>
                  <Link to="/admin/collection" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📦 استلام الكاش
                  </Link>
                </li>
                <li>
                  <Link to="/admin/pending" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🕒 السندات المتأخرة
                  </Link>
                </li>
                <li>
                  <Link to="/admin/matching" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧮 مطابقة المجاميع
                  </Link>
                </li>
                <li>
                  <Link to="/admin/summary" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    💳 ترحيل للبنك
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/notifications" className="block px-4 py-2 hover:bg-gray-200 rounded">
                🔔 الإشعارات
              </Link>
            </li>

            <li>
              <button
                onClick={logout}
                className="block w-full text-right px-4 py-2 hover:bg-red-100 text-red-600 rounded"
              >
                🚪 تسجيل الخروج
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b font-bold text-xl text-center">
          صندوقي 💰
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {user?.role === 'casher' && (
              <>
                <li>
                  <Link to="/opening" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧾 فتح الرصيد
                  </Link>
                </li>
                <li>
                  <Link to="/receipt" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📥 سند قبض
                  </Link>
                </li>
                <li>
                  <Link to="/disbursement" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📤 سند صرف
                  </Link>
                </li>
                <li>
                  <Link to="/delivery" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🚚 تسليم النقدية
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/vouchers" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📄 كل السندات
                  </Link>
                </li>
                <li>
                  <Link to="/admin/collection" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    📦 استلام الكاش
                  </Link>
                </li>
                <li>
                  <Link to="/admin/pending" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🕒 السندات المتأخرة
                  </Link>
                </li>
                <li>
                  <Link to="/admin/matching" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    🧮 مطابقة المجاميع
                  </Link>
                </li>
                <li>
                  <Link to="/admin/summary" className="block px-4 py-2 hover:bg-gray-200 rounded">
                    💳 ترحيل للبنك
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/notifications" className="block px-4 py-2 hover:bg-gray-200 rounded">
                🔔 الإشعارات
              </Link>
            </li>

            <li>
              <button
                onClick={logout}
                className="block w-full text-right px-4 py-2 hover:bg-red-100 text-red-600 rounded"
              >
                🚪 تسجيل الخروج
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
