"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Building2,
  Send,
  CreditCard,
  Settings,
  Coins,
  Shield,
  Download,
  Activity,
  LogOut,
  Wallet
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and statistics"
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts"
  },
  {
    name: "Providers",
    href: "/admin/providers",
    icon: Building2,
    description: "Provider profile management"
  },
  {
    name: "Senders",
    href: "/admin/senders",
    icon: Send,
    description: "Sender profile management"
  },
  {
    name: "Payment Orders",
    href: "/admin/payment-orders",
    icon: CreditCard,
    description: "Payment order tracking"
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: Activity,
    description: "Transaction logs and history"
  },
  {
    name: "Settlements",
    href: "/admin/settlements",
    icon: Wallet,
    description: "USDC settlement monitoring"
  },
  {
    name: "Currencies & Tokens",
    href: "/admin/currencies",
    icon: Coins,
    description: "Manage supported assets"
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: Download,
    description: "Data export and reports"
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration"
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/backstage');
        router.refresh();
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Admin Panel</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout from Admin</span>
        </Button>
      </div>
    </div>
  );
}
