import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  // Public routes that don't require authentication
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];
  
  // Check if the path is a public API route
  const isPublicApi = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicApi) {
    return NextResponse.next();
  }

  // Protected API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(token);
      
      // Add user info to request headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-email', payload.email);
      response.headers.set('x-user-role', payload.role);
      
      return response;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // Pages are handled client-side with localStorage - no middleware protection needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
