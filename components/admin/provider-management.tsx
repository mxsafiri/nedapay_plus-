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
  Eye,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Coins
} from 'lucide-react';
import type { ProviderWithDetails, AdminFilters } from '@/lib/types/admin';

interface ProviderManagementProps {
  initialProviders?: ProviderWithDetails[];
  initialCount?: number;
}

export function ProviderManagement({ initialProviders = [] }: ProviderManagementProps) {
  const [providers, setProviders] = useState<ProviderWithDetails[]>(initialProviders);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithDetails | null>(null);
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

  // Fetch providers from API
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/providers?${params}`);
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
      } else {
        toast.error('Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  // OLD Mock data - replaced with real API
  /*
  useEffect(() => {
    if (initialProviders.length === 0) {
      const mockProviders: ProviderWithDetails[] = [
        {
          id: 'provider_123',
          user_id: '1',
          trading_name: 'Global Payments Ltd',
          host_identifier: 'globalpay',
          provision_mode: 'auto',
          is_active: true,
          is_kyb_verified: true,
          visibility_mode: 'public',
          updated_at: '2024-01-20T14:15:00Z',
          user_profile: {
            id: '1',
            company_name: 'Global Payments Ltd',
            website: 'https://globalpay.com',
            phone: '+1987654321',
            address: '456 Business Ave, Metro, Country',
            country: 'UK',
            verification_status: 'verified',
            created_at: '2024-01-10T08:30:00Z',
            updated_at: '2024-01-20T14:15:00Z'
          } as any,
          provider_currencies: [
            {
              id: 'pc_1',
              provider_id: 'provider_123',
              currency_id: 'usd_id',
              available_balance: 50000,
              total_balance: 100000,
              reserved_balance: 50000,
              is_available: true,
              updated_at: '2024-01-20T14:15:00Z'
            }
          ],
          provider_ratings: [
            {
              id: 'pr_1',
              provider_profile_id: 'provider_123',
              trust_score: 4.8,
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-20T14:15:00Z'
            }
          ],
          order_tokens: []
        },
        {
          id: 'provider_456',
          user_id: '2',
          trading_name: 'Crypto Exchange Pro',
          host_identifier: 'cryptopro',
          provision_mode: 'manual',
          is_active: false,
          is_kyb_verified: false,
          visibility_mode: 'private',
          updated_at: '2024-01-18T09:30:00Z',
          user_profile: {
            id: '2',
            company_name: 'Crypto Exchange Pro',
            website: 'https://cryptopro.com',
            phone: '+1555123456',
            address: '789 Tech Street, Silicon Valley, USA',
            country: 'USA',
            verification_status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-18T09:30:00Z'
          } as any,
          provider_currencies: [],
          provider_ratings: [],
          order_tokens: []
        }
      ];
      setProviders(mockProviders);
    }
  }, [initialProviders]);
  */

  const handleRevokeProvider = async () => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await revokeProviderProfile(selectedProvider.user_id, 'admin_id', revokeReason);
      
      setProviders(providers.map(provider => 
        provider.id === selectedProvider.id 
          ? { ...provider, is_active: false }
          : provider
      ));
      
      toast.success('Provider profile revoked successfully');
      setShowRevokeDialog(false);
      setRevokeReason('');
      setSelectedProvider(null);
    } catch {
      toast.error('Failed to revoke provider profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (provider: ProviderWithDetails) => {
    if (!provider.is_active) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
    }
    if (!provider.is_kyb_verified) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending KYB</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  const getProvisionModeBadge = (mode: string) => {
    return (
      <Badge variant="outline" className={mode === 'auto' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
        {mode === 'auto' ? 'Auto' : 'Manual'}
      </Badge>
    );
  };

  const getTotalLiquidity = (provider: ProviderWithDetails) => {
    return provider.provider_currencies?.reduce((sum, currency) => sum + currency.total_balance, 0) || 0;
  };

  const getAvailableLiquidity = (provider: ProviderWithDetails) => {
    return provider.provider_currencies?.reduce((sum, currency) => sum + currency.available_balance, 0) || 0;
  };

  const getTrustScore = (provider: ProviderWithDetails) => {
    return provider.provider_ratings?.[0]?.trust_score || 0;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Filters</CardTitle>
          <CardDescription>Search and filter provider profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by trading name, company..."
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
                <SelectItem value="pending_kyb">Pending KYB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Providers ({providers.length})</CardTitle>
          <CardDescription>Manage provider profiles and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provision Mode</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Total Liquidity</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{provider.trading_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">@{provider.host_identifier}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(provider)}</TableCell>
                  <TableCell>{getProvisionModeBadge(provider.provision_mode)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{getTrustScore(provider).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${getTotalLiquidity(provider).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">${getAvailableLiquidity(provider).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>{new Date(provider.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProvider(provider);
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

      {/* Provider Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedProvider?.trading_name}
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Trading Name:</strong> {selectedProvider.trading_name || 'N/A'}</div>
                      <div><strong>User:</strong> {((selectedProvider as any).users?.first_name || 'N/A')} {((selectedProvider as any).users?.last_name || '')}</div>
                      <div><strong>Email:</strong> {(selectedProvider as any).users?.email || 'N/A'}</div>
                      <div><strong>KYB Status:</strong> {(selectedProvider as any).users?.kyb_verification_status || 'N/A'}</div>
                      <div><strong>Host ID:</strong> @{selectedProvider.host_identifier}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status & Ratings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Status:</strong> {getStatusBadge(selectedProvider)}</div>
                      <div><strong>KYB Verified:</strong> {selectedProvider.is_kyb_verified ? '✅ Yes' : '❌ No'}</div>
                      <div><strong>Trust Score:</strong> {getTrustScore(selectedProvider).toFixed(1)}/5.0</div>
                      <div><strong>Visibility:</strong> {selectedProvider.visibility_mode}</div>
                      <div><strong>Provision Mode:</strong> {getProvisionModeBadge(selectedProvider.provision_mode)}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="liquidity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Currency Balances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProvider.provider_currencies?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Currency</TableHead>
                            <TableHead>Total Balance</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Reserved</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProvider.provider_currencies?.map((currency) => (
                            <TableRow key={currency.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Coins className="w-4 h-4 mr-2" />
                                  Currency ID: {currency.currency_id}
                                </div>
                              </TableCell>
                              <TableCell>${currency.total_balance.toLocaleString()}</TableCell>
                              <TableCell className="text-green-600">${currency.available_balance.toLocaleString()}</TableCell>
                              <TableCell className="text-orange-600">${currency.reserved_balance.toLocaleString()}</TableCell>
                              <TableCell>
                                {currency.is_available ? (
                                  <Badge className="bg-green-500">Available</Badge>
                                ) : (
                                  <Badge variant="destructive">Unavailable</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No currency balances configured
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tokens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No token configurations found
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Provision Mode</Label>
                        <Select value={selectedProvider.provision_mode} disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Visibility Mode</Label>
                        <Select value={selectedProvider.visibility_mode} disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="whitelist">Whitelist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

      {/* Revoke Provider Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Provider Profile</DialogTitle>
            <DialogDescription>
              This will deactivate the provider profile for {selectedProvider?.trading_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for revocation</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for revoking provider profile..."
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
              onClick={handleRevokeProvider}
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
