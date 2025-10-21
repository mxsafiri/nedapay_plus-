// Admin Database Operations for NEDA Integration Dashboard
// Comprehensive CRUD operations for admin functionality
// Uses Prisma for database operations

import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';
import type { 
  AdminDashboardStats,
  AdminFilters,
  PaginationParams,
  UserWithProfiles,
  ProviderProfile,
  SenderProfile,
  PaymentOrder,
  FiatCurrency,
  Token,
  TransactionLog
} from '@/lib/types/admin';

// Dashboard Statistics
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    // Get user statistics using Prisma
    const userStats = await prisma.users.findMany({
      select: {
        kyb_verification_status: true,
        is_email_verified: true
      }
    });
    
    console.log('User stats query result:', { 
      dataLength: userStats?.length
    });

    // Get provider statistics
    const providerStats = await prisma.provider_profiles.findMany({
      select: {
        is_active: true,
        is_kyb_verified: true
      }
    });

    // Get sender statistics
    const senderStats = await prisma.sender_profiles.findMany({
      select: {
        is_active: true
      }
    });

    // Get payment order statistics
    const orderStats = await prisma.payment_orders.findMany({
      select: {
        status: true,
        amount_in_usd: true,
        created_at: true
      }
    });

    // Get transaction log statistics
    const transactionStats = await prisma.transaction_logs.findMany({
      select: {
        status: true,
        created_at: true
      }
    });

    // Get lock payment order statistics
    const lockOrderStats = await prisma.lock_payment_orders.findMany({
      select: {
        status: true,
        amount_in_usd: true,
        created_at: true
      }
    });

    // Get token and currency counts
    const tokenCount = await prisma.tokens.count({
      where: { is_enabled: true }
    });

    const currencyCount = await prisma.fiat_currencies.count({
      where: { is_enabled: true }
    });

    // Calculate statistics
    const totalUsers = userStats?.length || 0;
    const verifiedUsers = userStats?.filter(u => u.kyb_verification_status === 'verified').length || 0;
    const pendingVerification = userStats?.filter(u => u.kyb_verification_status === 'pending').length || 0;
    
    const totalProviders = providerStats?.length || 0;
    const activeProviders = providerStats?.filter(p => p.is_active).length || 0;
    
    const totalSenders = senderStats?.length || 0;
    const activeSenders = senderStats?.filter(s => s.is_active).length || 0;
    
    const totalPaymentOrders = orderStats?.length || 0;
    const completedOrders = orderStats?.filter(o => o.status === 'completed').length || 0;
    const pendingOrders = orderStats?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
    const failedOrders = orderStats?.filter(o => o.status === 'failed' || o.status === 'cancelled').length || 0;
    
    const totalVolumeUsd = orderStats?.reduce((sum, o) => sum + (o.amount_in_usd || 0), 0) || 0;
    const lockOrderVolumeUsd = lockOrderStats?.reduce((sum, o) => sum + (o.amount_in_usd || 0), 0) || 0;
    
    // Calculate monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyOrders = orderStats?.filter(o => new Date(o.created_at) >= currentMonth) || [];
    const monthlyLockOrders = lockOrderStats?.filter(o => new Date(o.created_at) >= currentMonth) || [];
    const monthlyVolumeUsd = monthlyOrders.reduce((sum, o) => sum + (o.amount_in_usd || 0), 0) + 
                            monthlyLockOrders.reduce((sum, o) => sum + (o.amount_in_usd || 0), 0);
    
    const totalTransactions = transactionStats?.length || 0;
    const totalLockOrders = lockOrderStats?.length || 0;
    const monthlyTransactions = transactionStats?.filter(t => new Date(t.created_at) >= currentMonth).length || 0;

    const stats = {
      total_users: totalUsers,
      verified_users: verifiedUsers,
      pending_verification: pendingVerification,
      total_providers: totalProviders,
      active_providers: activeProviders,
      total_senders: totalSenders,
      active_senders: activeSenders,
      total_payment_orders: totalPaymentOrders,
      completed_orders: completedOrders,
      pending_orders: pendingOrders,
      failed_orders: failedOrders,
      total_volume_usd: totalVolumeUsd + lockOrderVolumeUsd,
      monthly_volume_usd: monthlyVolumeUsd,
      total_transactions: totalTransactions,
      total_lock_orders: totalLockOrders,
      monthly_transactions: monthlyTransactions,
      active_tokens: tokenCount || 0,
      active_currencies: currencyCount || 0,
      webhook_success_rate: 0.95 // TODO: Calculate from webhook_retry_attempts
    };
    
    console.log('Final admin stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
}

// User Management Operations
export async function getAllUsersWithProfiles(
  filters: AdminFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<{ data: UserWithProfiles[]; count: number }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('users')
      .select(`
        *,
        sender_profiles(*),
        provider_profiles(*),
        api_keys(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters.verification_status?.length) {
      query = query.in('kyb_verification_status', filters.verification_status);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Apply pagination and sorting
    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .range(offset, offset + pagination.limit - 1)
      .order(pagination.sort_by || 'created_at', { ascending: pagination.sort_order === 'asc' });

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data to match UserWithProfiles interface
    const transformedData = data?.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      kyb_verification_status: user.kyb_verification_status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      sender_profiles: user.sender_profiles,
      provider_profiles: user.provider_profiles,
      api_keys: user.api_keys || []
    })) || [];

    return {
      data: transformedData as UserWithProfiles[],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching users with profiles:', error);
    throw error;
  }
}

export async function updateUserVerificationStatus(
  userId: string,
  status: 'not_started' | 'pending' | 'verified' | 'rejected',
  adminId: string,
  reason?: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Update user verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        kyb_verification_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: status === 'verified' ? 'verify_user' : 'reject_user',
          target_user_id: userId,
          admin_id: adminId,
          reason,
          new_status: status
        },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error updating user verification status:', error);
    throw error;
  }
}

// Sender Profile Management
export async function grantSenderProfile(
  userId: string,
  adminId: string,
  profileData: Partial<SenderProfile> = {}
): Promise<SenderProfile> {
  const supabase = createAdminClient();

  try {
    // Check if user already has a sender profile
    const { data: existingProfile } = await supabase
      .from('sender_profiles')
      .select('id')
      .eq('user_sender_profile', userId)
      .single();

    if (existingProfile) {
      throw new Error('User already has a sender profile');
    }

    // Create sender profile
    const { data, error } = await supabase
      .from('sender_profiles')
      .insert({
        user_sender_profile: userId,
        is_active: true,
        is_partner: false,
        domain_whitelist: [],
        updated_at: new Date().toISOString(),
        ...profileData
      })
      .select()
      .single();

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: 'grant_sender_profile',
          target_user_id: userId,
          admin_id: adminId,
          profile_id: data.id
        },
        created_at: new Date().toISOString()
      });

    return data as SenderProfile;
  } catch (error) {
    console.error('Error granting sender profile:', error);
    throw error;
  }
}

export async function revokeSenderProfile(
  userId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Deactivate sender profile instead of deleting
    const { error } = await supabase
      .from('sender_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_sender_profile', userId);

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: 'revoke_sender_profile',
          target_user_id: userId,
          admin_id: adminId,
          reason,
          action: 'deactivated'
        },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error revoking sender profile:', error);
    throw error;
  }
}

// Provider Profile Management
export async function grantProviderProfile(
  userId: string,
  adminId: string,
  profileData: Partial<ProviderProfile> = {}
): Promise<ProviderProfile> {
  const supabase = createAdminClient();

  try {
    // Check if user already has a provider profile
    const { data: existingProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_provider_profile', userId)
      .single();

    if (existingProfile) {
      throw new Error('User already has a provider profile');
    }

    // Generate unique provider ID
    const providerId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create provider profile
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert({
        id: providerId,
        user_provider_profile: userId,
        is_active: true,
        is_available: true,
        is_kyb_verified: false,
        provision_mode: 'auto',
        visibility_mode: 'public',
        updated_at: new Date().toISOString(),
        ...profileData
      })
      .select()
      .single();

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: 'grant_provider_profile',
          target_user_id: userId,
          admin_id: adminId,
          profile_id: data.id
        },
        created_at: new Date().toISOString()
      });

    return data as ProviderProfile;
  } catch (error) {
    console.error('Error granting provider profile:', error);
    throw error;
  }
}

export async function revokeProviderProfile(
  userId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Deactivate provider profile instead of deleting
    const { error } = await supabase
      .from('provider_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_provider_profile', userId);

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: 'revoke_provider_profile',
          target_user_id: userId,
          admin_id: adminId,
          reason,
          action: 'deactivated'
        },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error revoking provider profile:', error);
    throw error;
  }
}

// Payment Orders Management
export async function getPaymentOrders(
  filters: AdminFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<{ data: PaymentOrder[]; count: number }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('payment_orders')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Apply pagination and sorting
    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .range(offset, offset + pagination.limit - 1)
      .order(pagination.sort_by || 'created_at', { ascending: pagination.sort_order === 'asc' });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as PaymentOrder[],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching payment orders:', error);
    throw error;
  }
}

// System Configuration Management
export async function getFiatCurrencies(): Promise<FiatCurrency[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('fiat_currencies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as FiatCurrency[];
  } catch (error) {
    console.error('Error fetching fiat currencies:', error);
    throw error;
  }
}

export async function updateCurrencyStatus(
  currencyId: string,
  isEnabled: boolean,
  adminId: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('fiat_currencies')
      .update({ 
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', currencyId);

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: isEnabled ? 'enable_currency' : 'disable_currency',
          admin_id: adminId,
          currency_id: currencyId,
          enabled: isEnabled
        },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error updating currency status:', error);
    throw error;
  }
}

export async function getTokens(): Promise<Token[]> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('symbol');

    if (error) throw error;
    return data as Token[];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }
}

export async function updateTokenStatus(
  tokenId: string,
  isEnabled: boolean,
  adminId: string
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('tokens')
      .update({ 
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenId);

    if (error) throw error;

    // Log the admin action in transaction_logs
    await supabase
      .from('transaction_logs')
      .insert({
        status: 'order_initiated',
        metadata: {
          action_type: isEnabled ? 'enable_token' : 'disable_token',
          admin_id: adminId,
          token_id: tokenId,
          enabled: isEnabled
        },
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error updating token status:', error);
    throw error;
  }
}

// Transaction Logs (replaces audit logs)
export async function getTransactionLogs(
  filters: AdminFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<{ data: TransactionLog[]; count: number }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('transaction_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.search) {
      query = query.or(`status.ilike.%${filters.search}%,network.ilike.%${filters.search}%`);
    }

    // Apply pagination and sorting
    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .range(offset, offset + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as TransactionLog[],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching transaction logs:', error);
    throw error;
  }
}

// Legacy function name for compatibility
export const getAuditLogs = getTransactionLogs;

// Export utility functions
export async function exportData(
  table: string,
  filters: AdminFilters = {}
): Promise<unknown[]> {
  const supabase = createAdminClient();

  try {
    let query = supabase.from(table).select('*');

    // Apply basic filters
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error exporting data from ${table}:`, error);
    throw error;
  }
}
