import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get user from custom auth header
 * Expects: Authorization: Bearer {userId}
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    // Try to get user ID from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get from custom x-user-id header as fallback
      const userId = request.headers.get('x-user-id');
      if (!userId) {
        return null;
      }
      
      // Fetch user from database
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          scope: true,
          kyb_verification_status: true,
          has_early_access: true,
        }
      });
      
      return user;
    }
    
    const userId = authHeader.substring(7); // Remove 'Bearer '
    
    // Fetch user from database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        scope: true,
        kyb_verification_status: true,
        has_early_access: true,
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
