import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This page is restricted to specific user roles. Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/protected">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-out">Sign Out</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
