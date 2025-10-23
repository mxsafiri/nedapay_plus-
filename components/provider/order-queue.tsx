"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Network,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface PaymentOrder {
  id: string;
  amount: number;
  amountUsd: number;
  status: string;
  commission: number;
  token: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderQueueProps {
  userId?: string;
}

export function OrderQueue({ userId }: OrderQueueProps) {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [fulfillmentDialog, setFulfillmentDialog] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  
  // Fulfillment form state
  const [txHash, setTxHash] = useState("");
  const [txId, setTxId] = useState("");
  const [networkUsed, setNetworkUsed] = useState("");
  const [newStatus, setNewStatus] = useState<"processing" | "completed" | "failed">("completed");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUser) {
        toast.error('User not found');
        setLoading(false);
        return;
      }

      // Fetch orders assigned to this PSP via dashboard endpoint
      const response = await fetch('/api/dashboard/transactions', {
        headers: {
          'x-user-id': userId || currentUser.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for pending and processing orders only
        const activeOrders = (data.data?.transactions || []).filter(
          (order: PaymentOrder) => ['pending', 'processing'].includes(order.status)
        );
        setOrders(activeOrders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const openFulfillmentDialog = (order: PaymentOrder) => {
    setSelectedOrder(order);
    setFulfillmentDialog(true);
    // Reset form
    setTxHash("");
    setTxId("");
    setNetworkUsed("base");
    setNewStatus("completed");
  };

  const handleFulfillOrder = async () => {
    if (!selectedOrder) return;

    // Validation
    if (newStatus === "completed" && !txHash) {
      toast.error("Transaction hash is required for completed orders");
      return;
    }

    try {
      setFulfilling(true);

      const response = await fetch('/api/provider/fulfill-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          txHash: txHash || undefined,
          txId: txId || undefined,
          networkUsed: networkUsed || undefined,
        })
      });

      if (response.ok) {
        toast.success(`Order ${newStatus === 'completed' ? 'completed' : 'updated'} successfully!`);
        setFulfillmentDialog(false);
        setSelectedOrder(null);
        fetchOrders(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error fulfilling order:', error);
      toast.error('Failed to update order');
    } finally {
      setFulfilling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Order Queue
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Payment orders assigned to you for fulfillment
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Pending Orders</h3>
              <p className="text-muted-foreground">
                All caught up! New orders will appear here when assigned to you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => openFulfillmentDialog(order)}
                        disabled={order.status === 'completed'}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {order.status === 'pending' ? 'Start Fulfillment' : 'Update Status'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="font-semibold">${order.amountUsd.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Your Commission</p>
                        <p className="font-semibold text-green-600 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {order.commission.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Token</p>
                        <p className="font-semibold">{order.token}</p>
                      </div>
                    </div>

                    {order.txHash && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <p className="text-sm font-mono">{order.txHash.substring(0, 20)}...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fulfillment Dialog */}
      <Dialog open={fulfillmentDialog} onOpenChange={setFulfillmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Fulfill Payment Order</DialogTitle>
            <DialogDescription>
              Update the status of order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">USD Value:</span>
                  <span className="font-semibold">${selectedOrder.amountUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token:</span>
                  <span className="font-semibold">{selectedOrder.token}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Commission:</span>
                  <span className="font-semibold text-green-600">
                    ${selectedOrder.commission.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Details */}
              {newStatus !== 'failed' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tx-hash">
                      Transaction Hash {newStatus === 'completed' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="tx-hash"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tx-id">Transaction ID (Optional)</Label>
                    <Input
                      id="tx-id"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      placeholder="Internal transaction ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select value={networkUsed} onValueChange={setNetworkUsed}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="base-sepolia">Base Sepolia</SelectItem>
                        <SelectItem value="hedera">Hedera</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {newStatus === 'failed' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Marking this order as failed. The bank will be notified and may retry.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFulfillmentDialog(false)}
              disabled={fulfilling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFulfillOrder}
              disabled={fulfilling || (newStatus === 'completed' && !txHash)}
            >
              {fulfilling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {newStatus === 'completed' ? 'Complete Order' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
