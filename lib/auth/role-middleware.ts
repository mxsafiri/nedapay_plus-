import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PrismaClient, UserRole } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

/**
 * Require user to have specific role(s) to access a route
 * 
 * Usage in API routes:
 * ```ts
 * export async function POST(req: Request) {
 *   const { user } = await requireRole(['BANK']);
 *   // Only banks can access this endpoint
 * }
 * ```
 * 
 * @param allowedRoles - Array of allowed roles (BANK, PSP, ADMIN)
 * @returns Authenticated user with role
 * @throws Redirects to /sign-in if not authenticated
 * @throws Redirects to /unauthorized if wrong role
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{ user: AuthenticatedUser; role: UserRole }> {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
  
  if (error || !supabaseUser) {
    redirect('/sign-in');
  }
  
  // Get user role from database
  const userData = await prisma.users.findUnique({
    where: { id: supabaseUser.id },
    select: {
      role: true,
      first_name: true,
      last_name: true,
      email: true,
    }
  });
  
  if (!userData) {
    redirect('/sign-in');
  }
  
  // Check if user has required role
  if (!allowedRoles.includes(userData.role)) {
    redirect('/unauthorized');
  }
  
  return {
    user: {
      id: supabaseUser.id,
      email: userData.email,
      role: userData.role,
      firstName: userData.first_name,
      lastName: userData.last_name,
    },
    role: userData.role,
  };
}

/**
 * Get current user with role (doesn't redirect, returns null if not authenticated)
 * 
 * Usage:
 * ```ts
 * const currentUser = await getCurrentUser();
 * if (currentUser?.role === 'ADMIN') {
 *   // Show admin features
 * }
 * ```
 * 
 * @returns Current user or null
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
  
  if (error || !supabaseUser) {
    return null;
  }
  
  const userData = await prisma.users.findUnique({
    where: { id: supabaseUser.id },
    select: {
      role: true,
      first_name: true,
      last_name: true,
      email: true,
    }
  });
  
  if (!userData) {
    return null;
  }
  
  return {
    id: supabaseUser.id,
    email: userData.email,
    role: userData.role,
    firstName: userData.first_name,
    lastName: userData.last_name,
  };
}

/**
 * Check if user has specific role(s) without redirecting
 * 
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has one of the allowed roles
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? allowedRoles.includes(user.role) : false;
}

/**
 * Require user to be a bank
 */
export async function requireBank() {
  return requireRole(['BANK']);
}

/**
 * Require user to be a PSP
 */
export async function requirePSP() {
  return requireRole(['PSP']);
}

/**
 * Require user to be an admin
 */
export async function requireAdmin() {
  return requireRole(['ADMIN']);
}

/**
 * Require user to be either a bank or PSP
 */
export async function requireBankOrPSP() {
  return requireRole(['BANK', 'PSP']);
}
