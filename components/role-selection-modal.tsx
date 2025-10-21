"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building2, Send } from 'lucide-react';

interface RoleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  userScope: string;
}

export function RoleSelectionModal({ open, onClose, userScope }: RoleSelectionModalProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'sender' | 'provider' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      // Store the selected role in localStorage
      localStorage.setItem('activeRole', selectedRole);
      onClose();
      // Redirect based on role
      router.push('/protected');
    }
  };

  // Only show modal if user has both roles
  if (userScope !== 'both') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Role</DialogTitle>
          <DialogDescription>
            You have access to both Sender and Provider features. Please select how you&apos;d like to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <Card
            className={`p-6 cursor-pointer transition-all border-2 ${
              selectedRole === 'sender'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('sender')}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Send className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Sender</h3>
                <p className="text-sm text-muted-foreground">
                  Initiate payments, configure trading settings, and manage transactions as a payment sender.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>I&apos;m a sender, I want to enable my users to onramp and offramp</li>
                  <li>• Manage payment orders</li>
                  <li>• API integration for payments</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all border-2 ${
              selectedRole === 'provider'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('provider')}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Provide liquidity, fulfill payment orders, and earn fees as a liquidity provider.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Manage liquidity pools</li>
                  <li>• Fulfill payment orders</li>
                  <li>• Configure provider settings</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full sm:w-auto"
          >
            Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can switch roles anytime from your profile settings
        </p>
      </DialogContent>
    </Dialog>
  );
}
