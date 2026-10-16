import AdminLayout from '../../../src/Components/AdminLayout';
import AdminProtectedRoute from '../../../src/Components/AdminProtectedRoute';
import Admin from '../../../src/Pages/Admin/Admin';

export default function XAdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminProtectedRoute>
        <Admin />
      </AdminProtectedRoute>
    </AdminLayout>
  );
}
