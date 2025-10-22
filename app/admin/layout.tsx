import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for admin session cookie
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  // Redirect to backstage login if no valid session
  if (!adminSession || adminSession.value !== 'authenticated') {
    redirect('/backstage');
  }
  
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
