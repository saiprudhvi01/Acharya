import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/:path*'],
};

export async function middleware(request: NextRequest) {
  // No authentication in middleware - handle in individual API routes
  return NextResponse.next();
}
