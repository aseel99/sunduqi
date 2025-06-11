import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-gray-400 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو لا يمكن الوصول إليها.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}