/**
 * Test Mode Detection Utilities
 * Determines if a request is in test/sandbox mode based on API key
 */

/**
 * Check if an API key is a test key
 * Test keys start with 'np_test_', live keys start with 'np_live_'
 */
export function isTestApiKey(apiKey: string): boolean {
  return apiKey.startsWith('np_test_');
}

/**
 * Check if an API key is a live key
 */
export function isLiveApiKey(apiKey: string): boolean {
  return apiKey.startsWith('np_live_');
}

/**
 * Extract test mode from API key prefix
 */
export function getTestModeFromKey(apiKey: string): boolean {
  return isTestApiKey(apiKey);
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return isTestApiKey(apiKey) || isLiveApiKey(apiKey);
}

/**
 * Get API key type as string
 */
export function getApiKeyType(apiKey: string): 'test' | 'live' | 'unknown' {
  if (isTestApiKey(apiKey)) return 'test';
  if (isLiveApiKey(apiKey)) return 'live';
  return 'unknown';
}
