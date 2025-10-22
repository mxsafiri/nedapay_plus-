"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Building2,
  Send,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  scope: string;
  is_email_verified: boolean;
  has_early_access: boolean;
  kyb_verification_status: string;
  created_at: string;
  updated_at: string;
  provider_profiles: any;
  sender_profiles: any;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [updatingKyb, setUpdatingKyb] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  // TODO: Implement pagination
  // const [pagination, setPagination] = useState<PaginationParams>({
  //   page: 1,
  //   limit: 50,
  //   sort_by: 'created_at',
  // Fetch users from API
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, scopeFilter, verifiedFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (scopeFilter !== 'all') params.append('scope', scopeFilter);
      if (verifiedFilter !== 'all') params.append('is_verified', verifiedFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (userId: string) => {
    setResendingEmail(userId);
    try {
      const response = await fetch('/api/admin/users/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification email sent successfully!');
        if (data.verificationLink) {
          console.log('Verification link:', data.verificationLink);
        }
      } else {
        toast.error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to send verification email');
    } finally {
      setResendingEmail(null);
    }
  };

  const handleApproveKyb = async (userId: string) => {
    setUpdatingKyb(true);
    try {
      const response = await fetch('/api/admin/users/verify-kyb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'verified' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('KYB approved successfully!');
        fetchUsers(); // Refresh user list
        setShowUserDialog(false);
      } else {
        toast.error(data.error || 'Failed to approve KYB');
      }
    } catch (error) {
      console.error('Error approving KYB:', error);
      toast.error('Failed to approve KYB');
    } finally {
      setUpdatingKyb(false);
    }
  };

  const handleRejectKyb = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setUpdatingKyb(true);
    try {
      const response = await fetch('/api/admin/users/verify-kyb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          status: 'rejected',
          reason: rejectReason
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('KYB rejected');
        fetchUsers(); // Refresh user list
        setShowRejectDialog(false);
        setShowUserDialog(false);
        setRejectReason('');
      } else {
        toast.error(data.error || 'Failed to reject KYB');
      }
    } catch (error) {
      console.error('Error rejecting KYB:', error);
      toast.error('Failed to reject KYB');
    } finally {
      setUpdatingKyb(false);
    }
  };

  const getEmailVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Verified</Badge>;
  };

  const getKYBStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'sender':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Send className="w-3 h-3 mr-1" />Sender</Badge>;
      case 'provider':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Building2 className="w-3 h-3 mr-1" />Provider</Badge>;
      case 'both':
      case 'sender provider':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">sender provider</Badge>;
      default:
        return <Badge variant="outline">{scope}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Filters</CardTitle>
          <CardDescription>Search and filter user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="sender">Sender</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Email Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Manage user accounts and email verification</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>KYB Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getScopeBadge(user.scope)}</TableCell>
                    <TableCell>{getEmailVerificationBadge(user.is_email_verified)}</TableCell>
                    <TableCell>{getKYBStatusBadge(user.kyb_verification_status)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!user.is_email_verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendVerification(user.id)}
                            disabled={resendingEmail === user.id}
                          >
                            {resendingEmail === user.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user information and verification status
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scope</p>
                  <div className="mt-1">{getScopeBadge(selectedUser.scope)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                  <div className="mt-1">{getEmailVerificationBadge(selectedUser.is_email_verified)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">KYB Status</p>
                  <div className="mt-1">{getKYBStatusBadge(selectedUser.kyb_verification_status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Early Access</p>
                  <p className="text-sm">{selectedUser.has_early_access ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                </div>
              </div>
              
              {!selectedUser.is_email_verified && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleResendVerification(selectedUser.id);
                      setShowUserDialog(false);
                    }}
                    disabled={resendingEmail === selectedUser.id}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </Button>
                </div>
              )}

              {/* KYB Approval Actions */}
              {selectedUser.kyb_verification_status === 'pending' && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">KYB Verification Actions</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveKyb(selectedUser.id)}
                      disabled={updatingKyb}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve KYB
                    </Button>
                    <Button
                      onClick={() => setShowRejectDialog(true)}
                      disabled={updatingKyb}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject KYB
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject KYB Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYB Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.first_name} {selectedUser?.last_name}'s KYB verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection (required)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectKyb}
              disabled={updatingKyb || !rejectReason.trim()}
            >
              {updatingKyb ? 'Rejecting...' : 'Reject KYB'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
