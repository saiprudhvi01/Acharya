import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export const config = {
  matcher: ['/api/:path*'],
  runtime: 'nodejs',
};

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];
  const isPublicApi = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicApi) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-role', payload.role as string);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
