import { Suspense } from 'react';
import { AdminDashboard } from '@/components/admin/dashboard';
import { AdminDashboardSkeleton } from '@/components/admin/dashboard-skeleton';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, providers, senders, and system configuration
          </p>
        </div>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
