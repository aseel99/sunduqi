import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminManagement() {
  const [tab, setTab] = useState('users');
  return (
    <div className="p-6 max-w-6xl mx-auto text-right font-[Tajawal]">
      <h1 className="text-2xl font-bold mb-6 text-yellow-600">صفحة الإدارة</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          إدارة المستخدمين
        </button>
        <button
          onClick={() => setTab('branches')}
          className={`px-4 py-2 rounded ${tab === 'branches' ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-white'}`}
        >
          إدارة الفروع
        </button>
      </div>

      {tab === 'users' ? <UserManagement /> : <BranchManagement />}
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: '', username: '', password: '', role: 'casher', branch_id: '' });
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل المستخدمين');
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل الفروع');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users', form);
      toast.success('تم إضافة المستخدم');
      setForm({ full_name: '', username: '', password: '', role: 'casher', branch_id: '' });
      fetchUsers();
    } catch (err) {
      toast.error('فشل في إضافة المستخدم');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input placeholder="الاسم الكامل" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="border p-2 rounded w-60" required />
          <input placeholder="اسم المستخدم" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="border p-2 rounded w-60" required />
          <input type="password" placeholder="كلمة المرور" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="border p-2 rounded w-60" required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="border p-2 rounded w-60">
            <option value="casher">كاشير</option>
            <option value="admin">أدمن</option>
          </select>
          <select value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })} className="border p-2 rounded w-60" required>
            <option value="">اختر الفرع</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name_ar}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-yellow-500 text-white px-6 py-2 rounded">إضافة</button>
      </form>

      <table className="w-full text-sm bg-white border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">الاسم</th>
            <th className="p-2 border">المستخدم</th>
            <th className="p-2 border">الصلاحية</th>
            <th className="p-2 border">الفرع</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2 border">{user.full_name}</td>
              <td className="p-2 border">{user.username}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">{user.branch?.name_ar || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [nameAr, setNameAr] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل الفروع');
    }
  };

  const handleAddBranch = async () => {
    try {
      await axios.post('/branches', { name_ar: nameAr });
      toast.success('تم إضافة الفرع');
      setNameAr('');
      fetchBranches();
    } catch (err) {
      toast.error('فشل في إضافة الفرع');
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          placeholder="اسم الفرع"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <button onClick={handleAddBranch} className="bg-yellow-500 text-white px-4 py-2 rounded">
          إضافة فرع
        </button>
      </div>

      <table className="w-full text-sm bg-white border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">اسم الفرع</th>
            <th className="p-2 border">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(branch => (
            <tr key={branch.id} className="border-t">
              <td className="p-2 border">{branch.name_ar}</td>
              <td className="p-2 border">{branch.is_active ? 'فعال' : 'غير فعال'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
