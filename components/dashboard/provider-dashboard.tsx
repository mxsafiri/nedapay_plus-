import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Activity,
  PieChart,
  Settings,
  Plus,
  BarChart3
} from "lucide-react";


export function ProviderDashboard() {
  const stats = [
    {
      title: "Total Liquidity",
      value: "$0.00",
      change: "+0%",
      changeType: "positive" as const,
      icon: Wallet,
    },
    {
      title: "Earnings",
      value: "$0.00",
      change: "+0%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Transactions Served",
      value: "0",
      change: "+0",
      changeType: "positive" as const,
      icon: Activity,
    },
    {
      title: "APY",
      value: "0%",
      change: "+0%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liquidity Management */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deposit funds to provide liquidity for onramp and offramp transactions. 
              Earn fees on every transaction you facilitate.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <Wallet className="mr-2 h-4 w-4" />
                Deposit Funds
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Liquidity Pools
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Node Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure your liquidity node settings, including supported currencies, 
              fee structures, and risk parameters.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure Node
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Node Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Pools</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">No active liquidity pools</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Average Fill Rate</p>
              <p className="text-2xl font-bold">0%</p>
              <p className="text-xs text-muted-foreground">No transactions yet</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Response Time</p>
              <p className="text-2xl font-bold">0ms</p>
              <p className="text-xs text-muted-foreground">Average response time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Pools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Liquidity Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No liquidity pools yet</p>
            <p className="text-sm">
              Start by adding liquidity to your first pool to begin earning fees.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create First Pool
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started as a Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              As a Provider, you earn fees by providing liquidity for cross-border transactions. 
              Here&apos;s how to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Complete your account verification and KYC</li>
              <li>Set up your liquidity node configuration</li>
              <li>Deposit initial liquidity into supported currency pools</li>
              <li>Configure your fee structure and risk parameters</li>
              <li>Monitor your node performance and earnings</li>
              <li>Scale your operations by adding more liquidity</li>
            </ol>
            <div className="flex gap-2 pt-4">
              <Button>
                Provider Documentation
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
