import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Simple middleware without Supabase auth
  // Authentication is handled:
  // - Client-side via localStorage for /protected routes
  // - Server-side via Prisma in API routes
  
  console.log('🔍 Middleware: Allowing path:', pathname);
  
  // Allow all routes to pass through
  return NextResponse.next({ request });
}
