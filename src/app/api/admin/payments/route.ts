import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['admin']);
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const payments = db.prepare(`
    SELECT p.id, p.amount, p.status, p.paymentType, p.subscriptionPlan, p.createdAt,
           u.name as userName, u.email as userEmail,
           c.title as courseTitle
    FROM payments p
    LEFT JOIN users u ON p.userId = u.id
    LEFT JOIN courses c ON p.courseId = c.id
    ORDER BY p.createdAt DESC
    LIMIT 50
  `).all();

  const totalRevenue = (db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'").get() as any)?.total ?? 0;

  return NextResponse.json({ payments, totalRevenue }, { status: 200 });
}
