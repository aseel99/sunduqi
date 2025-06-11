import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Opening from './pages/Opening';
import ChooseVoucher from './pages/ChooseVoucher';
import Receipt from './pages/Receipt';
import Disbursement from './pages/Disbursement';
import VoucherDetails from './pages/VoucherDetails';
import CashDelivery from './pages/CashDelivery';
import AdminVouchers from './pages/AdminVouchers';
import Matching from './pages/Matching';
import AdminCollection from './pages/AdminCollection';
import AdminPending from './pages/AdminPending';
import AdminSummary from './pages/AdminSummary';
import AdminFinanceSummary from './pages/AdminFinanceSummary';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  console.log('User in App:', localStorage.getItem('user'));
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<div>Hello</div>} />

        {/* Protected Layout for logged-in users */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/opening" element={<Opening />} />
            <Route path="/vouchers" element={<ChooseVoucher />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/receipt/:id" element={<VoucherDetails />} />
            <Route path="/disbursement" element={<Disbursement />} />
            <Route path="/disbursement/:id" element={<VoucherDetails />} />
            <Route path="/cash-delivery" element={<CashDelivery />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Admin-only routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/vouchers" element={<AdminVouchers />} />
              <Route path="/admin/collection" element={<AdminCollection />} />
              <Route path="/admin/matching" element={<Matching />} />
              <Route path="/admin/finance-summary" element={<AdminFinanceSummary />} /> {/* ملخص المقبوضات والمصروفات */}
              <Route path="/admin/pending" element={<AdminPending />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
