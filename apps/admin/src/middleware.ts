import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for Edge Runtime (resets per isolate)
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // --- 1. ULTRA-FAST RATE LIMITING FOR ALL APIs ---
  if (request.nextUrl.pathname.startsWith('/api')) {
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 50; // Ultra secure: max 50 requests per minute per IP
    
    const now = Date.now();
    const requestLog = rateLimitMap.get(ip) || { count: 0, startTime: now };
    
    if (now - requestLog.startTime > windowMs) {
      // Reset window
      requestLog.count = 1;
      requestLog.startTime = now;
    } else {
      requestLog.count++;
      if (requestLog.count > maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests. Security rate limit exceeded.' }, 
          { status: 429 }
        );
      }
    }
    rateLimitMap.set(ip, requestLog);
  }

  // --- 2. ULTRA-SECURE ROUTE PROTECTION ---
  // Protect all routes except /login, /api/auth, and Next.js static files
  const isStaticFile = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.');
  const isPublicRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/api/auth');

  if (!isStaticFile && !isPublicRoute) {
    const adminSession = request.cookies.get('admin_secure_session');
    
    if (!adminSession || adminSession.value !== 'valid_admin_token') {
      // If no valid session cookie is found, instantly reject and redirect to Login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
