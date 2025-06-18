import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from '../api/axios';
import logo from '../assets/eshalabi-logo.png';

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
    <div className="min-h-screen bg-[#eeeeee] flex items-center justify-center font-[Tajawal]" dir="rtl">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white border border-gray-300 rounded shadow-md"
      >
        {/* Logo */}
        <div className="flex justify-center py-6 border-b">
          <img src={logo} alt="شعار" className="h-12 w-auto" />
        </div>

        {/* Header Bar */}
        <div className="bg-[#2f435a] text-white px-4 py-3 flex items-center justify-between border-b">
          <h2 className="text-sm font-semibold">تسجيل دخول</h2>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 00-8 8v1a1 1 0 001 1h1v2a3 3 0 006 0v-2h1a1 1 0 001-1v-1a8 8 0 00-8-8z" />
          </svg>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 text-red-600 text-sm bg-red-100 border-b border-red-200">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="px-4 py-6 space-y-4">
          <div className="border border-gray-300 rounded shadow-inner">
            <input
              type="text"
              placeholder="البريد الإلكتروني"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 focus:outline-none bg-white text-sm"
            />
          </div>

          <div className="border border-gray-300 rounded shadow-inner">
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 focus:outline-none bg-white text-sm"
            />
          </div>

          {/* Remember me */}
          <div className="bg-[#f1f1f1] px-3 py-2 rounded flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="remember"
              className="border border-gray-300 rounded"
            />
            <label htmlFor="remember" className="font-semibold text-gray-700">
              تذكرني
            </label>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded text-sm transition"
            >
              تسجيل دخول
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
