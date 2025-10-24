"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export function ProfileSwitcher() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = getCurrentUser();
    setUser(userData);
  }, []);

  const handleSettings = () => {
    router.push("/protected/settings");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear all local storage data
      localStorage.removeItem("activeProfile");
      localStorage.removeItem("user");
      sessionStorage.clear();
      
      // Redirect to login regardless of API response
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Still clear local data and redirect even if API fails
      localStorage.removeItem("activeProfile");
      localStorage.removeItem("user");
      sessionStorage.clear();
      router.push("/auth/login");
      router.refresh();
    }
  };

  if (!user) return null;

  const displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              ID: {user.id?.slice(0, 8)}...
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              ID: {user.id?.slice(0, 12)}...
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
