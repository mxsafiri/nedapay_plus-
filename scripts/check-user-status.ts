import { prisma } from '../lib/prisma';

async function checkUserStatus() {
  const email = 'kingvictor77@gmail.com';
  
  try {
    const user = await prisma.users.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        kyb_verification_status: true,
        scope: true,
        created_at: true,
        updated_at: true
      }
    });

    console.log('User data:', JSON.stringify(user, null, 2));

    if (user) {
      // Check sender profile
      const senderProfile = await prisma.sender_profiles.findFirst({
        where: { user_sender_profile: user.id }
      });
      console.log('Sender profile:', senderProfile ? 'EXISTS' : 'NOT FOUND');

      // Check provider profile
      const providerProfile = await prisma.provider_profiles.findFirst({
        where: { user_provider_profile: user.id }
      });
      console.log('Provider profile:', providerProfile ? 'EXISTS' : 'NOT FOUND');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
