import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from '../api/axios';

export default function Login() {
  // State for input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Access login function from auth context
  const { login } = useAuth();

  // Router hook for redirecting after login
  const navigate = useNavigate();

  // State to handle login errors
  const [error, setError] = useState('');

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/auth/login', { username, password });
      login(res.data); // Save token and user
      navigate('/');   // Redirect to homepage after successful login
    } catch (err) {
      setError('فشل تسجيل الدخول. تحقق من البيانات.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-gray-900 font-[Tajawal] px-4"
      dir="rtl"
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg shadow-[0_0_12px_#8e8e8e] p-8"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8 text-center text-[#33485d]">
          تسجيل الدخول
        </h2>

        {/* Error message if login fails */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Username Field */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            اسم المستخدم
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#047291] focus:border-transparent"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-8">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#047291] focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-[#047291] hover:bg-[#03627a] text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center text-lg"
        >
          <span>دخول</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
