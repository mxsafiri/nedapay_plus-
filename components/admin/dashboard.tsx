import { getAdminDashboardStats } from '@/lib/database/admin-operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  Send,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Coins,
  Zap
} from 'lucide-react';

export async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users.toLocaleString(),
      description: `${stats.verified_users} verified, ${stats.pending_verification} pending`,
      icon: Users,
      trend: "+12% from last month"
    },
    {
      title: "Active Providers",
      value: `${stats.active_providers}/${stats.total_providers}`,
      description: "Provider profiles",
      icon: Building2,
      trend: "+5% from last month"
    },
    {
      title: "Active Senders",
      value: `${stats.active_senders}/${stats.total_senders}`,
      description: "Sender profiles",
      icon: Send,
      trend: "+8% from last month"
    },
    {
      title: "Total Volume",
      value: `$${stats.total_volume_usd.toLocaleString()}`,
      description: `$${stats.monthly_volume_usd.toLocaleString()} this month`,
      icon: DollarSign,
      trend: "+23% from last month"
    },
    {
      title: "Payment Orders",
      value: stats.total_payment_orders.toLocaleString(),
      description: `${stats.monthly_transactions} this month`,
      icon: CreditCard,
      trend: "+15% from last month"
    },
    {
      title: "Success Rate",
      value: `${((stats.completed_orders / stats.total_payment_orders) * 100).toFixed(1)}%`,
      description: "Order completion rate",
      icon: CheckCircle,
      trend: "+2.1% from last month"
    }
  ];

  const orderStats = [
    {
      label: "Completed",
      value: stats.completed_orders,
      color: "bg-green-500",
      icon: CheckCircle
    },
    {
      label: "Pending",
      value: stats.pending_orders,
      color: "bg-yellow-500",
      icon: Clock
    },
    {
      label: "Failed",
      value: stats.failed_orders,
      color: "bg-red-500",
      icon: XCircle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
            <CardDescription>Current payment order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{stat.value.toLocaleString()}</span>
                    <Badge variant="secondary">
                      {((stat.value / stats.total_payment_orders) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Key system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Tokens</span>
                </div>
                <Badge variant="outline">{stats.active_tokens}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Currencies</span>
                </div>
                <Badge variant="outline">{stats.active_currencies}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Webhook Success Rate</span>
                </div>
                <Badge variant="outline">{(stats.webhook_success_rate * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Verify Users</span>
              {stats.pending_verification > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {stats.pending_verification}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Manage Providers</span>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
              <Send className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Manage Senders</span>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Review Orders</span>
              {stats.pending_orders > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {stats.pending_orders}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
