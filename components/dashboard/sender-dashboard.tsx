import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  TrendingUp,
  Users,
  Globe,
  CreditCard,
  Zap
} from "lucide-react";


export function SenderDashboard() {
  const stats = [
    {
      title: "Total Volume",
      value: "$0.00",
      change: "+0%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Transactions",
      value: "0",
      change: "+0",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Active Routes",
      value: "0",
      change: "+0",
      changeType: "positive" as const,
      icon: Globe,
    },
    {
      title: "Success Rate",
      value: "0%",
      change: "+0%",
      changeType: "positive" as const,
      icon: Users,
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Send Money (Onramp)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Convert fiat currency to cryptocurrency for your customers. 
              Enable seamless onramp experiences with our API.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Start Onramp Transaction
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
              Receive Money (Offramp)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Convert cryptocurrency to fiat currency for your customers. 
              Provide easy cash-out solutions.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Start Offramp Transaction
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Integration Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Generate your API keys to start integrating
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate Keys
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Webhook Configuration</p>
                  <p className="text-sm text-muted-foreground">
                    Set up webhooks to receive transaction updates
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Test Transaction</p>
                  <p className="text-sm text-muted-foreground">
                    Run a test transaction to verify your integration
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started as a Sender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              As a Sender, you can provide onramp and offramp services to your customers. 
              Here&apos;s how to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Complete your account verification</li>
              <li>Generate your API keys in Settings</li>
              <li>Review our API documentation</li>
              <li>Configure webhooks for transaction updates</li>
              <li>Run test transactions</li>
              <li>Go live with real transactions</li>
            </ol>
            <div className="flex gap-2 pt-4">
              <Button>
                View Documentation
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
