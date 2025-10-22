import { Suspense } from 'react';
import { ProviderManagement } from '@/components/admin/provider-management';
import { ProviderManagementSkeleton } from '@/components/admin/provider-management-skeleton';

export default function AdminProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provider Management</h1>
          <p className="text-muted-foreground">
            Manage provider profiles, liquidity, and trading configurations
          </p>
        </div>
      </div>

      <Suspense fallback={<ProviderManagementSkeleton />}>
        <ProviderManagement />
      </Suspense>
    </div>
  );
}
