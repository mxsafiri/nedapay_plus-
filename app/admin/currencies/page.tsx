import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function CurrenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Currencies & Tokens</h1>
        <p className="text-muted-foreground">
          Manage supported fiat currencies and crypto tokens
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Supported Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-base">Currency & token management coming soon.</p>
            <p className="text-sm mt-2">Enable/disable trading corridors (TZS → CNY, etc.) and supported tokens (USDC).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
