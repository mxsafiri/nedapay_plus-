import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export interface OnboardingStatus {
  isComplete: boolean;
  role: 'BANK' | 'PSP' | 'ADMIN';
  currentStep: number;
  totalSteps: number;
  hasProfile: boolean;
  hasApiKey: boolean;
  hasCompletedKYB: boolean;
  missingSteps: string[];
}

/**
 * Check if user has completed onboarding
 * 
 * @param userId - User ID to check
 * @returns Onboarding status with details
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      sender_profiles: true,
      provider_profiles: true,
      kyb_profiles: true,
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const missingSteps: string[] = [];
  let currentStep = 0;
  const role = user.role as 'BANK' | 'PSP' | 'ADMIN';

  // Admin users don't need onboarding
  if (role === 'ADMIN') {
    return {
      isComplete: true,
      role,
      currentStep: 0,
      totalSteps: 0,
      hasProfile: true,
      hasApiKey: true,
      hasCompletedKYB: true,
      missingSteps: [],
    };
  }

  // Check BANK onboarding (3 steps)
  if (role === 'BANK') {
    const totalSteps = 3;
    
    // Step 1: Bank profile created
    const hasProfile = !!user.sender_profiles;
    if (!hasProfile) {
      missingSteps.push('Create bank profile');
    } else {
      currentStep = 1;
    }

    // Step 2: KYB documents uploaded
    const hasCompletedKYB = user.kyb_verification_status !== 'not_started';
    if (hasProfile && !hasCompletedKYB) {
      missingSteps.push('Upload KYB documents');
    } else if (hasCompletedKYB) {
      currentStep = 2;
    }

    // Step 3: White-label configured (API keys feature coming soon)
    const hasWhiteLabel = hasProfile && !!user.sender_profiles?.white_label_config;
    
    if (hasCompletedKYB && !hasWhiteLabel) {
      missingSteps.push('Configure white-label branding');
    } else if (hasWhiteLabel) {
      currentStep = 3;
    }

    return {
      isComplete: currentStep === totalSteps,
      role,
      currentStep,
      totalSteps,
      hasProfile,
      hasApiKey: false, // API keys feature coming soon
      hasCompletedKYB,
      missingSteps,
    };
  }

  // Check PSP onboarding (4 steps)
  if (role === 'PSP') {
    const totalSteps = 4;
    
    // Step 1: PSP profile created
    const hasProfile = !!user.provider_profiles;
    if (!hasProfile) {
      missingSteps.push('Create PSP profile');
    } else {
      currentStep = 1;
    }

    // Step 2: KYB documents & supported countries
    const hasCompletedKYB = user.kyb_verification_status !== 'not_started';
    const hasSupportedCountries = hasProfile && !!user.provider_profiles?.supported_countries;
    
    if (hasProfile && (!hasCompletedKYB || !hasSupportedCountries)) {
      missingSteps.push('Upload KYB & select countries');
    } else if (hasCompletedKYB && hasSupportedCountries) {
      currentStep = 2;
    }

    // Step 3: Treasury accounts & commission rate configured
    const hasTreasuryAccounts = hasProfile && !!user.provider_profiles?.treasury_accounts;
    const hasCommissionRate = hasProfile && user.provider_profiles?.commission_rate !== undefined;
    
    if (hasCompletedKYB && (!hasTreasuryAccounts || !hasCommissionRate)) {
      missingSteps.push('Configure treasury & rates');
    } else if (hasTreasuryAccounts && hasCommissionRate) {
      currentStep = 3;
    }

    // Step 4: Profile complete (API keys feature coming soon)
    // For now, consider onboarding complete once treasury & rates are configured
    if (hasTreasuryAccounts && hasCommissionRate) {
      currentStep = 4;
    }

    return {
      isComplete: currentStep === totalSteps,
      role,
      currentStep,
      totalSteps,
      hasProfile,
      hasApiKey: false, // API keys feature coming soon
      hasCompletedKYB,
      missingSteps,
    };
  }

  // Fallback
  return {
    isComplete: false,
    role,
    currentStep: 0,
    totalSteps: 0,
    hasProfile: false,
    hasApiKey: false,
    hasCompletedKYB: false,
    missingSteps: ['Unknown role'],
  };
}

/**
 * Check if user should be redirected to onboarding
 * 
 * @param userId - User ID to check
 * @returns True if user needs to complete onboarding
 */
export async function requiresOnboarding(userId: string): Promise<boolean> {
  const status = await getOnboardingStatus(userId);
  return !status.isComplete;
}
