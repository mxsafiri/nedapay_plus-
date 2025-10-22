import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingStatus } from '@/lib/onboarding/status';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get onboarding status
  const status = await getOnboardingStatus(user.id);

  // If already complete, redirect to dashboard
  if (status.isComplete) {
    redirect('/protected');
  }

  // Redirect to role-specific onboarding
  if (status.role === 'BANK') {
    redirect('/onboarding/bank');
  } else if (status.role === 'PSP') {
    redirect('/onboarding/psp');
  }

  // Fallback
  redirect('/protected');
}
