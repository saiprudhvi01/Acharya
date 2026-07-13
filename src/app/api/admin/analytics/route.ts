import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['admin']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get user registrations over time
    const userRegistrations = db.prepare(`
      SELECT 
        strftime('%Y', createdAt) as year,
        strftime('%m', createdAt) as month,
        strftime('%d', createdAt) as day,
        COUNT(*) as count
      FROM users
      WHERE createdAt >= ?
      GROUP BY year, month, day
      ORDER BY year, month, day
    `).all(startDateStr);

    // Get revenue over time
    const revenueData = db.prepare(`
      SELECT 
        strftime('%Y', createdAt) as year,
        strftime('%m', createdAt) as month,
        strftime('%d', createdAt) as day,
        SUM(amount) as total
      FROM payments
      WHERE createdAt >= ? AND status = 'completed'
      GROUP BY year, month, day
      ORDER BY year, month, day
    `).all(startDateStr);

    // Get course popularity
    const coursePopularity = db.prepare(`
      SELECT title, enrolledStudents, ratings
      FROM courses
      WHERE createdAt >= ?
      ORDER BY enrolledStudents DESC
      LIMIT 10
    `).all(startDateStr);

    // Get subscription growth
    const subscriptionGrowth = db.prepare(`
      SELECT subscriptionPlan as plan, COUNT(*) as count
      FROM users
      WHERE subscriptionIsActive = 1 AND subscriptionStartDate >= ?
      GROUP BY subscriptionPlan
    `).all(startDateStr);

    // Current stats
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any;
    const totalTeachers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get() as any;
    const totalCourses = db.prepare("SELECT COUNT(*) as count FROM courses").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'").get() as any;

    return NextResponse.json(
      {
        userRegistrations,
        revenueData,
        coursePopularity,
        subscriptionGrowth,
        stats: {
          totalStudents: totalStudents.count,
          totalTeachers: totalTeachers.count,
          totalCourses: totalCourses.count,
          totalRevenue: totalRevenue.total || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
