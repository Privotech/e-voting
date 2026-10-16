import AdminLayout from '../src/Components/AdminLayout';
import AdminSignup from '../src/Auth/AdminSignup';

export default function XAdminPage() {
  return (
    <AdminLayout>
      <AdminSignup />
    </AdminLayout>
  );
}
