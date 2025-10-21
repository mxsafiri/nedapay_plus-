// Database Operations Utility
// Centralized database operations for the NEDA Integration Dashboard

import { createClient } from '@/lib/supabase/client';
import type {
  User,
  UserInsert,
  UserUpdate,
  ProviderProfile,
  ProviderProfileInsert,
  ProviderProfileUpdate,
  SenderProfile,
  SenderProfileInsert,
  SenderProfileUpdate,
  ApiKey,
  ApiKeyInsert,
  PaymentOrder,
  PaymentOrderInsert,
  FiatCurrency,
  Token,
  TransactionLog,
  TransactionLogInsert
} from '@/lib/types/database';
// User Service
export const UserService = {
  async getById(id: string): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  async create(user: UserInsert): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: UserUpdate): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  }
};

// Provider Profile Service
export const ProviderProfileService = {
  async getByUserId(userId: string): Promise<ProviderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_provider_profile', userId)
      .single();
    
    if (error) {
      console.error('Error fetching provider profile:', error);
      return null;
    }
    return data;
  },

  async create(profile: ProviderProfileInsert): Promise<ProviderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating provider profile:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: ProviderProfileUpdate): Promise<ProviderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('provider_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating provider profile:', error);
      return null;
    }
    return data;
  }
};

// Sender Profile Service
export const SenderProfileService = {
  async getByUserId(userId: string): Promise<SenderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sender_profiles')
      .select('*')
      .eq('user_sender_profile', userId)
      .single();
    
    if (error) {
      console.error('Error fetching sender profile:', error);
      return null;
    }
    return data;
  },

  async create(profile: SenderProfileInsert): Promise<SenderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sender_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating sender profile:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: SenderProfileUpdate): Promise<SenderProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sender_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating sender profile:', error);
      return null;
    }
    return data;
  }
};

// API Key Service
export const ApiKeyService = {
  async getByUserId(userId: string): Promise<ApiKey[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .or(`sender_profile_api_key.eq.${userId},provider_profile_api_key.eq.${userId}`);
    
    if (error) {
      console.error('Error fetching API keys:', error);
      return [];
    }
    return data || [];
  },

  async create(apiKey: ApiKeyInsert): Promise<ApiKey | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('api_keys')
      .insert(apiKey)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating API key:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
    return true;
  }
};

// Payment Order Service
export const PaymentOrderService = {
  async getById(id: string): Promise<PaymentOrder | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching payment order:', error);
      return null;
    }
    return data;
  },

  async getBySenderId(senderId: string): Promise<PaymentOrder[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('sender_profile_payment_orders', senderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payment orders:', error);
      return [];
    }
    return data || [];
  },

  async create(order: PaymentOrderInsert): Promise<PaymentOrder | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_orders')
      .insert(order)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment order:', error);
      return null;
    }
    return data;
  },

  async updateStatus(id: string, status: PaymentOrder['status']): Promise<PaymentOrder | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment order status:', error);
      return null;
    }
    return data;
  }
};

// Transaction Log Service
export const TransactionLogService = {
  async create(log: TransactionLogInsert): Promise<TransactionLog | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transaction_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction log:', error);
      return null;
    }
    return data;
  },

  async getByOrderId(orderId: string): Promise<TransactionLog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('payment_order_transactions', orderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transaction logs:', error);
      return [];
    }
    return data || [];
  }
};

// Currency and Token Services
export const CurrencyService = {
  async getEnabled(): Promise<FiatCurrency[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fiat_currencies')
      .select('*')
      .eq('is_enabled', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
    return data || [];
  }
};

export const TokenService = {
  async getEnabled(): Promise<Token[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('is_enabled', true)
      .order('symbol');
    
    if (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
    return data || [];
  }
};

// Database Utilities
export const DatabaseUtils = {
  // Generate unique IDs
  generateId(): string {
    return crypto.randomUUID();
  },

  // Format timestamps
  now(): string {
    return new Date().toISOString();
  },

  // Validate UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};

// Legacy exports for backward compatibility
export const UserProfileService = UserService;
export const TransactionService = PaymentOrderService;
export const AuditLogService = TransactionLogService;
