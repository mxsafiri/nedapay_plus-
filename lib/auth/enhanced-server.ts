import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from './server';
import { getTestModeFromKey, isValidApiKeyFormat } from './test-mode';

export interface EnhancedUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  scope: string | null;
  kyb_verification_status: string | null;
  has_early_access: boolean | null;
  isTestMode: boolean;
  apiKeyType: 'test' | 'live' | 'none';
}

/**
 * Enhanced user authentication with test mode detection
 * Checks both Authorization header and x-api-key header
 */
export async function getEnhancedUserFromRequest(request: NextRequest): Promise<EnhancedUser | null> {
  try {
    // First, try standard user authentication
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return null;
    }

    // Check for API key in headers
    const apiKeyHeader = request.headers.get('x-api-key');
    const authHeader = request.headers.get('authorization');
    
    let isTestMode = false;
    let apiKeyType: 'test' | 'live' | 'none' = 'none';

    // Try to detect test mode from API key
    if (apiKeyHeader && isValidApiKeyFormat(apiKeyHeader)) {
      isTestMode = getTestModeFromKey(apiKeyHeader);
      apiKeyType = isTestMode ? 'test' : 'live';
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Check if token is an API key
      if (isValidApiKeyFormat(token)) {
        isTestMode = getTestModeFromKey(token);
        apiKeyType = isTestMode ? 'test' : 'live';
      }
    }

    // If no API key found, check if user has any API keys and use that
    if (apiKeyType === 'none') {
      const userWithKeys = await prisma.users.findUnique({
        where: { id: user.id },
        include: {
          sender_profiles: {
            include: {
              api_keys: true
            }
          },
          provider_profiles: {
            include: {
              api_keys: true
            }
          }
        }
      });

      const apiKey = userWithKeys?.sender_profiles?.api_keys || userWithKeys?.provider_profiles?.api_keys;
      
      if (apiKey) {
        isTestMode = apiKey.is_test;
        apiKeyType = isTestMode ? 'test' : 'live';
      }
    }

    return {
      ...user,
      isTestMode,
      apiKeyType
    };
  } catch (error) {
    console.error('Error getting enhanced user from request:', error);
    return null;
  }
}

/**
 * Validate that the operation matches the API key type
 * Prevents accidentally mixing test and live data
 */
export function validateTestModeConsistency(
  requestIsTest: boolean,
  apiKeyIsTest: boolean
): { valid: boolean; error?: string } {
  if (requestIsTest && !apiKeyIsTest) {
    return {
      valid: false,
      error: 'Cannot create test transactions with a live API key. Please use a test API key (np_test_*).'
    };
  }

  if (!requestIsTest && apiKeyIsTest) {
    return {
      valid: false,
      error: 'Cannot create live transactions with a test API key. Please use a live API key (np_live_*).'
    };
  }

  return { valid: true };
}
