import { Suspense } from 'react';
import AdminLayout from '../../../src/Components/AdminLayout';
import AdminLogin from '../../../src/Auth/AdminLogin';

export default function XAdminLoginPage() {
  return (
    <AdminLayout>
      <Suspense fallback={null}>
        <AdminLogin />
      </Suspense>
    </AdminLayout>
  );
}
