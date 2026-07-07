import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET teacher earnings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    // Get all courses taught by this teacher
    const courses = db.prepare('SELECT id, price FROM courses WHERE teacherId = ?').all(userId) as any[];
    const courseIds = courses.map(c => c.id);

    // Get all payments for these courses
    const payments = db.prepare(`
      SELECT p.*, u.name as userName, u.email as userEmail, c.title as courseTitle
      FROM payments p
      JOIN users u ON p.userId = u.id
      JOIN courses c ON p.courseId = c.id
      WHERE p.courseId IN (${courseIds.map(() => '?').join(',')}) AND p.status = 'completed'
      ORDER BY p.createdAt DESC
    `).all(...courseIds) as any[];

    // Calculate totals (85% to teacher)
    const totalEarnings = payments.reduce((sum, p) => sum + (p.amount * 0.85), 0);
    const pendingPayouts = payments.reduce((sum, p) => sum + (p.amount * 0.85), 0);
    const completedPayouts = 0; // Simplified for SQLite

    // Monthly earnings
    const monthlyEarnings: { [key: string]: number } = {};
    payments.forEach(payment => {
      const month = new Date(payment.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (payment.amount * 0.85);
    });

    return NextResponse.json(
      {
        totalEarnings,
        pendingPayouts,
        completedPayouts,
        monthlyEarnings,
        payments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
