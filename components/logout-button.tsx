"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { clearCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear all local data
      clearCurrentUser();
      localStorage.removeItem("activeProfile");
      sessionStorage.clear();
      
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      
      // Still clear local data and redirect even if API fails
      clearCurrentUser();
      localStorage.removeItem("activeProfile");
      sessionStorage.clear();
      
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    }
  };

  return <Button onClick={logout} variant="outline" size="sm">Logout</Button>;
}
