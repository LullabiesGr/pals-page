import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';

export function AdminSupportPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading page-wrap" role="status" aria-live="polite">
        <div className="admin-spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <AdminLoginPage />;
  }

  return <AdminDashboardPage />;
}

export function AdminRedirect() {
  return <Navigate to="/admin/support" replace />;
}
