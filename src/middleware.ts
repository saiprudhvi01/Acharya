import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const config = {
  matcher: ['/api/:path*'],
  runtime: 'nodejs',
};

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/healthz'];
  const isPublicApi = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicApi) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!token) {
      console.log('No token provided for:', request.nextUrl.pathname);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      console.log('Verifying token for:', request.nextUrl.pathname);
      const payload = verifyToken(token);
      console.log('Token verified successfully for user:', payload.userId);

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-role', payload.role as string);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      console.error('Token verification failed for:', request.nextUrl.pathname, error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
