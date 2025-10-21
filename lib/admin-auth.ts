// Admin Authentication Utilities
import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  userId: string;
  email: string | undefined;
  timestamp: number;
}

/**
 * Check if user has valid admin session
 */
export async function hasValidAdminSession(userId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get(ADMIN_SESSION_COOKIE);
    
    if (!adminSession) {
      return false;
    }

    const sessionData: AdminSession = JSON.parse(adminSession.value);
    const sessionAge = Date.now() - sessionData.timestamp;
    
    // Check if session expired
    if (sessionAge > SESSION_DURATION) {
      return false;
    }
    
    // Verify session belongs to current user
    if (sessionData.userId !== userId) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
