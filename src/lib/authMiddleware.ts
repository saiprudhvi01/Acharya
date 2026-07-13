import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export function authenticateRequest(request: NextRequest): AuthUser | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest, allowedRoles?: ('student' | 'teacher' | 'admin')[]): AuthUser | { error: string; status: number } {
  const user = authenticateRequest(request);
  
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: 'Unauthorized. Insufficient permissions.', status: 403 };
  }

  return user;
}
