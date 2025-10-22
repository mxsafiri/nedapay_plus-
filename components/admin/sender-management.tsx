"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Search,
  Globe,
  Eye,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Webhook,
  CreditCard
} from 'lucide-react';
import type { SenderWithDetails, AdminFilters } from '@/lib/types/admin';

interface SenderManagementProps {
  initialSenders?: SenderWithDetails[];
  initialCount?: number;
}

export function SenderManagement({ initialSenders = [] }: SenderManagementProps) {
  const [senders, setSenders] = useState<SenderWithDetails[]>(initialSenders);
  const [loading, setLoading] = useState(false);
  const [selectedSender, setSelectedSender] = useState<SenderWithDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [filters, setFilters] = useState<AdminFilters>({});
  // TODO: Implement pagination
  // const [pagination, setPagination] = useState<PaginationParams>({
  //   page: 1,
  //   limit: 50,
  //   sort_by: 'updated_at',
  //   sort_order: 'desc'
  // });

  // Fetch senders from API
  useEffect(() => {
    fetchSenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/senders?${params}`);
      const data = await response.json();

      if (data.success) {
        setSenders(data.senders);
      } else {
        toast.error('Failed to fetch senders');
      }
    } catch (error) {
      console.error('Error fetching senders:', error);
      toast.error('Failed to fetch senders');
    } finally {
      setLoading(false);
    }
  };

  // OLD Mock data - replaced with real API
  /*
  useEffect(() => {
    if (initialSenders.length === 0) {
      const mockSenders: SenderWithDetails[] = [
        {
          id: '1',
          user_id: '1',
          webhook_url: 'https://api.acme.com/webhooks/nedapay',
          domain_whitelist: ['acme.com', 'app.acme.com'],
          is_partner: true,
          is_active: true,
          updated_at: '2024-01-20T14:15:00Z',
          user_profile: {
            id: '1',
            company_name: 'Acme Corp',
            website: 'https://acme.com',
            phone: '+1234567890',
            address: '123 Main St, City, USA',
            country: 'USA',
            verification_status: 'verified',
            created_at: '2024-01-10T08:30:00Z',
            updated_at: '2024-01-20T14:15:00Z'
          } as any,
          order_tokens: [],
          payment_orders: []
        },
        {
          id: '2',
          user_id: '2',
          webhook_url: undefined,
          domain_whitelist: [],
          provider_id: undefined,
          is_partner: false,
          is_active: false,
          updated_at: '2024-01-18T09:30:00Z',
          user_profile: {
            id: '2',
            company_name: 'StartupXYZ',
            website: 'https://startupxyz.com',
            phone: '+1555987654',
            address: '456 Tech Ave, Innovation City, Canada',
            country: 'Canada',
            verification_status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-18T09:30:00Z'
          } as any,
          order_tokens: [],
          payment_orders: []
        }
      ];
      setSenders(mockSenders);
    }
  }, [initialSenders]);
  */

  const handleRevokeSender = async () => {
    if (!selectedSender) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await revokeSenderProfile(selectedSender.user_id, 'admin_id', revokeReason);
      
      setSenders(senders.map(sender => 
        sender.id === selectedSender.id 
          ? { ...sender, is_active: false }
          : sender
      ));
      
      toast.success('Sender profile revoked successfully');
      setShowRevokeDialog(false);
      setRevokeReason('');
      setSelectedSender(null);
    } catch {
      toast.error('Failed to revoke sender profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (sender: SenderWithDetails) => {
    if (!sender.is_active) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
    }
    if ((sender as any).users?.kyb_verification_status !== 'verified') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Verification</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  const getPartnerBadge = (isPartner: boolean) => {
    return isPartner ? (
      <Badge className="bg-purple-500 hover:bg-purple-600">
        <Star className="w-3 h-3 mr-1" />Partner
      </Badge>
    ) : (
      <Badge variant="outline">Standard</Badge>
    );
  };

  const getWebhookStatus = (webhookUrl?: string) => {
    return webhookUrl ? (
      <Badge className="bg-blue-500 hover:bg-blue-600">
        <Webhook className="w-3 h-3 mr-1" />Configured
      </Badge>
    ) : (
      <Badge variant="outline">Not Set</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Sender Filters</CardTitle>
          <CardDescription>Search and filter sender profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by company name, website..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  status: value === 'all' ? undefined : [value] 
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.verification_status?.[0] || 'all'}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  verification_status: value === 'all' ? undefined : [value] 
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Partner Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="partner">Partners</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Senders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Senders ({senders.length})</CardTitle>
          <CardDescription>Manage sender profiles and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Webhook</TableHead>
                <TableHead>Domains</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {senders.map((sender) => (
                <TableRow key={sender.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{(sender as any).users?.first_name} {(sender as any).users?.last_name}</div>
                      <div className="text-sm text-muted-foreground">{(sender as any).users?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(sender)}</TableCell>
                  <TableCell>{getPartnerBadge(sender.is_partner)}</TableCell>
                  <TableCell>{getWebhookStatus(sender.webhook_url)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sender.domain_whitelist.length > 0 ? (
                        <div>
                          <div>{sender.domain_whitelist[0]}</div>
                          {sender.domain_whitelist.length > 1 && (
                            <div className="text-muted-foreground">
                              +{sender.domain_whitelist.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{(sender as any).payment_orders?.length || 0}</div>
                  </TableCell>
                  <TableCell>{new Date(sender.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSender(sender);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSender(sender);
                          setShowRevokeDialog(true);
                        }}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sender Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sender Details</DialogTitle>
            <DialogDescription>
              Detailed information for {(selectedSender as any)?.users?.first_name} {(selectedSender as any)?.users?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedSender && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="webhook">Webhook</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>User:</strong> {(selectedSender as any).users?.first_name} {(selectedSender as any).users?.last_name}</div>
                      <div><strong>Email:</strong> {(selectedSender as any).users?.email || 'N/A'}</div>
                      <div><strong>KYB Status:</strong> {(selectedSender as any).users?.kyb_verification_status || 'N/A'}</div>
                      <div><strong>Profile ID:</strong> {selectedSender.id}</div>
                      <div><strong>Active:</strong> {selectedSender.is_active ? 'Yes' : 'No'}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status & Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Status:</strong> {getStatusBadge(selectedSender)}</div>
                      <div><strong>Partner:</strong> {getPartnerBadge(selectedSender.is_partner)}</div>
                      <div><strong>KYB Verification:</strong> {(selectedSender as any).users?.kyb_verification_status || 'N/A'}</div>
                      <div><strong>Webhook:</strong> {getWebhookStatus(selectedSender.webhook_url)}</div>
                      <div><strong>Domains:</strong> {selectedSender.domain_whitelist.length} configured</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="webhook" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSender.webhook_url ? (
                      <div className="space-y-2">
                        <div><strong>URL:</strong> {selectedSender.webhook_url}</div>
                        <div className="flex items-center gap-2">
                          <Webhook className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Webhook configured</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>No webhook URL configured</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="domains" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Whitelist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSender.domain_whitelist.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSender.domain_whitelist.map((domain, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span>{domain}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>No domains whitelisted</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p>No payment orders found</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Sender Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Sender Profile</DialogTitle>
            <DialogDescription>
              This will deactivate the sender profile for {(selectedSender as any)?.users?.first_name} {(selectedSender as any)?.users?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for revocation</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for revoking sender profile..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeSender}
              disabled={loading}
            >
              <UserX className="w-4 h-4 mr-2" />
              Revoke Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
