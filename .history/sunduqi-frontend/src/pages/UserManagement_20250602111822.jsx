import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'casher',
    branch_id: '',
    is_active: true,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data.data); // Updated to access paginated data
    } catch (err) {
      toast.error('فشل تحميل المستخدمين');
      console.error('Error fetching users:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data); // Updated to access paginated data
    } catch (err) {
      toast.error('فشل تحميل الفروع');
      console.error('Error fetching branches:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/users', formData);
      toast.success('تم إضافة المستخدم بنجاح');
      setFormData({
        username: '',
        full_name: '',
        role: 'casher',
        branch_id: '',
        is_active: true,
        password: '',
      });
      fetchUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'فشل إضافة المستخدم';
      toast.error(errorMessage);
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين كلمة المرور؟')) return;
    try {
      await axios.post(`/users/${userId}/reset-password`);
      toast.success('تم إعادة تعيين كلمة المرور');
    } catch (err) {
      toast.error('فشل إعادة التعيين');
      console.error('Error resetting password:', err);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`/users/${userId}/toggle-active`);
      toast.success(`تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المستخدم`);
      fetchUsers();
    } catch (err) {
      toast.error('فشل تغيير الحالة');
      console.error('Error toggling user status:', err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">إدارة المستخدمين</h2>
        
        {/* Add User Form */}
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">إضافة مستخدم جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">اسم المستخدم</label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">الاسم الكامل</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">الدور</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="casher">كاشير</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">الفرع</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.branch_id}
                onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                required
              >
                <option value="">اختر الفرع</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">كلمة المرور</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="ml-2"
              />
              <label htmlFor="is_active" className="text-sm">مفعل</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'جاري الحفظ...' : 'إضافة مستخدم'}
          </button>
        </form>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">اسم المستخدم</th>
                <th className="p-2 border">الاسم الكامل</th>
                <th className="p-2 border">الدور</th>
                <th className="p-2 border">الفرع</th>
                <th className="p-2 border">الحالة</th>
                <th className="p-2 border">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{user.full_name}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : 'كاشير'}
                    </span>
                  </td>
                  <td className="p-2 border">{user.branch?.name_ar || 'N/A'}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'مفعل' : 'معطل'}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`px-2 py-1 text-xs rounded ${
                          user.is_active 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {user.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded"
                      >
                        إعادة تعيين كلمة المرور
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}