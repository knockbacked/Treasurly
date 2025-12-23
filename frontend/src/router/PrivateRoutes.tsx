import { getStoredUser } from '../lib/storage';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import ViewTransaction from '../pages/ViewTransaction';
import BudgetsPage from '../pages/BudgetsPage';
import ReportsPage from '../pages/ReportsPage';
import DevTransactionsPage from '../pages/DevTransactionsPage';
import DevTransactionsSeed from '../pages/DevTransactionsSeed';

export default function PrivateRoutes() {
  const user = getStoredUser();
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<ViewTransaction />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dev" element={<DevTransactionsPage />} />
        <Route path="/dev-seed" element={<DevTransactionsSeed />} />


        
      </Route>
    </Routes>
  );
}
