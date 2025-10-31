import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from './lib/auth'; // Assuming lib/auth.ts is at the root level relative to middleware.ts

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session_id')?.value;
  const user = await getCurrentUser(sessionCookie);

  const { pathname } = request.nextUrl;

  // Allow access to public pages
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    // If user is logged in and tries to access /login, redirect to their dashboard
    if (user && pathname === '/login') {
      if (user.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      if (user.role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url));
      if (user.role === 'student') return NextResponse.redirect(new URL('/student', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', request.url)); // Or redirect to their own dashboard
    }
  }

  if (pathname.startsWith('/teacher')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'teacher' && user.role !== 'admin') { // Admin can also access teacher routes
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  if (pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'student' && user.role !== 'admin') { // Admin can also access student routes
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  // If no specific redirection, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)', // Apply to all paths except API routes, static files, images, and favicon
  ],
};
