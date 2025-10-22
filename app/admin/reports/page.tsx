import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export data reports for analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-base">Report generation coming soon.</p>
            <p className="text-sm mt-2">Export transaction data, user reports, and financial analytics.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
