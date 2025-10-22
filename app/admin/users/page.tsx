import { Suspense } from 'react';
import { UserManagement } from '@/components/admin/user-management';
import { UserManagementSkeleton } from '@/components/admin/user-management-skeleton';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            View, verify, and manage user accounts and profiles
          </p>
        </div>
      </div>

      <Suspense fallback={<UserManagementSkeleton />}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
