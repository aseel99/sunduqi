// Matching.jsx
// Acts as a router: loads AdminMatching or CashierMatching depending on user role.

import { useAuth } from '../auth/AuthContext';
import AdminMatching from './AdminMatching';
import CashierMatching from './CashierMatching';

export default function Matching() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'admin' ? <AdminMatching /> : <CashierMatching />;
}
