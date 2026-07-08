import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  if (request.headers.get('x-user-role') !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
