// Supabase Admin Client - Uses Service Role Key to bypass RLS
// Only use this for admin operations that need full database access

import { createClient } from '@supabase/supabase-js';

// Service role client - bypasses RLS policies
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  // Create client with service role key (no Database type to avoid RLS type issues)
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Helper to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  
  // Check if user has admin metadata or belongs to admin role
  const { data: user, error } = await adminClient.auth.admin.getUserById(userId);
  
  if (error || !user) {
    return false;
  }
  
  // Check if user has admin role in metadata
  const isAdmin = user.user.user_metadata?.role === 'admin' || 
                  user.user.user_metadata?.is_admin === true ||
                  user.user.app_metadata?.role === 'admin';
  
  return isAdmin;
}
