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
      setUsers(res.data.data);
    } catch (err) {
      toast.error('فشل تحميل المستخدمين');
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data);
    } catch (err) {
      toast.error('فشل تحميل الفروع');
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
      const msg = err.response?.data?.message || 'فشل الإضافة';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('هل أنت متأكد من إعادة تعيين كلمة المرور؟')) return;
    try {
      await axios.post(`/users/${userId}/reset-password`);
      toast.success('تم إعادة تعيين كلمة المرور');
    } catch {
      toast.error('فشل في إعادة التعيين');
    }
  };

  const toggleUserStatus = async (id, status) => {
    try {
      await axios.patch(`/users/${id}/toggle-active`);
      toast.success(`تم ${status ? 'تعطيل' : 'تفعيل'} المستخدم`);
      fetchUsers();
    } catch {
      toast.error('فشل في تغيير الحالة');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-right font-[Tajawal]" dir="rtl">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">إدارة المستخدمين</h2>

        {/* نموذج الإضافة */}
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">إضافة مستخدم جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">اسم المستخدم</label>
              <input
                type="text"
                minLength={3}
                required
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">الدور</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="casher">كاشير</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">الفرع</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                required
              >
                <option value="">اختر الفرع</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">كلمة المرور</label>
              <input
                type="password"
                minLength={6}
                required
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="ml-2"
              />
              <label htmlFor="is_active" className="text-sm">مفعل</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:bg-blue-300"
          >
            {loading ? 'جاري الحفظ...' : 'إضافة المستخدم'}
          </button>
        </form>

        {/* جدول المستخدمين */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-2 border">اسم المستخدم</th>
                <th className="p-2 border">الاسم الكامل</th>
                <th className="p-2 border">الدور</th>
                <th className="p-2 border">الفرع</th>
                <th className="p-2 border">الحالة</th>
                <th className="p-2 border">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{user.full_name}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : 'كاشير'}
                    </span>
                  </td>
                  <td className="p-2 border">{user.branch?.name_ar || '-'}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'مفعل' : 'معطل'}
                    </span>
                  </td>
                  <td className="p-2 border space-x-2 space-x-reverse">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`px-2 py-1 text-xs rounded ${
                        user.is_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {user.is_active ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded"
                    >
                      إعادة تعيين
                    </button>
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
