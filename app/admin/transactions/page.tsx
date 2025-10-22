import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">
          Detailed transaction logs and history for compliance monitoring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-base">Transaction log viewer coming soon.</p>
            <p className="text-sm mt-2">View detailed transaction history, Hedera logs, and compliance data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
