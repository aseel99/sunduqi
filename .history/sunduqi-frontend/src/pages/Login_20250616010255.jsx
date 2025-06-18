import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/auth/login', { username, password });
      login(res.data);
      navigate('/');
    } catch {
      setError('فشل تسجيل الدخول. تحقق من البيانات.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center font-[Tajawal]" dir="rtl">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded shadow-lg border border-gray-300"
      >
        {/* Top Header Bar */}
        <div className="bg-[#2f435a] text-white px-6 py-4 rounded-t flex items-center justify-between">
          <h2 className="text-lg font-bold">تسجيل دخول</h2>
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 00-8 8v1a1 1 0 001 1h1v2a3 3 0 006 0v-2h1a1 1 0 001-1v-1a8 8 0 00-8-8z" />
          </svg>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-2 text-red-600 text-sm bg-red-100 border-t border-b border-red-200">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="البريد الإلكتروني"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-[#2f435a] shadow-inner"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-[#2f435a] shadow-inner"
              required
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              id="remember"
              className="rounded border-gray-400 focus:ring-[#2f435a]"
            />
            <label htmlFor="remember">تذكرني</label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold text-sm transition"
          >
            تسجيل دخول
          </button>
        </div>
      </form>
    </div>
  );
}
