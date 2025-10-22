import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PaymentOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment Orders</h1>
        <p className="text-muted-foreground">
          Track and manage payment orders across the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Order Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-base">Payment order management coming soon.</p>
            <p className="text-sm mt-2">This page will show all cross-border payment orders.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
