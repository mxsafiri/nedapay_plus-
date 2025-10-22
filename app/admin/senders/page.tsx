import { Suspense } from 'react';
import { SenderManagement } from '@/components/admin/sender-management';
import { SenderManagementSkeleton } from '@/components/admin/sender-management-skeleton';

export default function AdminSendersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sender Management</h1>
          <p className="text-muted-foreground">
            Manage sender profiles, webhooks, and payment configurations
          </p>
        </div>
      </div>

      <Suspense fallback={<SenderManagementSkeleton />}>
        <SenderManagement />
      </Suspense>
    </div>
  );
}
