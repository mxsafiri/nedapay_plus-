"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";

interface ProfileSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSelectionModal({ open, onClose }: ProfileSelectionModalProps) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);

  const handleSelectProfile = (profile: "sender" | "provider") => {
    setSelecting(true);
    localStorage.setItem("activeProfile", profile);
    
    // Small delay for better UX
    setTimeout(() => {
      onClose();
      router.push("/protected");
      router.refresh();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Choose Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Select which profile you want to use for this session
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-3 p-6 hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelectProfile("sender")}
            disabled={selecting}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Sender</div>
              <div className="text-sm text-muted-foreground">
                Send payments and manage transactions
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-3 p-6 hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelectProfile("provider")}
            disabled={selecting}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Provider</div>
              <div className="text-sm text-muted-foreground">
                Provide liquidity and manage orders
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
