import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingStatus } from '@/lib/onboarding/status';

// GET - Check if user has completed onboarding
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get onboarding status
    const status = await getOnboardingStatus(user.id);

    return NextResponse.json({
      isComplete: status.isComplete,
      role: status.role,
      currentStep: status.currentStep,
      totalSteps: status.totalSteps,
      missingSteps: status.missingSteps
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check onboarding status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
