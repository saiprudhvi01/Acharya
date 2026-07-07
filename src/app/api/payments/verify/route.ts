import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      type,
      courseId,
      subscription,
    } = body;

    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Find existing payment
    const existingPayment = db.prepare('SELECT * FROM payments WHERE razorpayOrderId = ?').get(razorpayOrderId) as any;

    if (existingPayment) {
      return NextResponse.json(
        { message: 'Payment already verified', payment: existingPayment },
        { status: 200 }
      );
    }

    // Get course price if course purchase
    let amount = 0;
    let teacherShare = 0;
    let platformShare = 0;

    if (type === 'course' && courseId) {
      const course = db.prepare('SELECT price FROM courses WHERE id = ?').get(courseId) as any;
      if (course) {
        amount = course.price;
        teacherShare = course.price * 0.85;
        platformShare = course.price * 0.15;

        // Enroll student in course
        const enrollment = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(userId, courseId);
        if (!enrollment) {
          db.prepare('INSERT INTO user_enrollments (userId, courseId) VALUES (?, ?)').run(userId, courseId);

          // Update course enrollment count
          db.prepare('UPDATE courses SET enrolledStudents = enrolledStudents + 1 WHERE id = ?').run(courseId);
        }
      }
    }

    // Update subscription for user
    if (type === 'subscription' && subscription) {
      const now = new Date();
      let endDate = new Date();

      if (subscription === 'basic') {
        endDate.setMonth(now.getMonth() + 1);
      } else if (subscription === 'standard') {
        endDate.setMonth(now.getMonth() + 2);
      } else if (subscription === 'premium') {
        endDate.setFullYear(now.getFullYear() + 1);
      }

      db.prepare(`
        UPDATE users 
        SET subscriptionPlan = ?, subscriptionStartDate = ?, subscriptionEndDate = ?, subscriptionIsActive = 1
        WHERE id = ?
      `).run(subscription, now.toISOString(), endDate.toISOString(), userId);
    }

    // Create payment record
    const result = db.prepare(`
      INSERT INTO payments (userId, courseId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature, status, paymentType, subscriptionPlan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      type === 'course' ? courseId : null,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      'completed',
      type,
      type === 'subscription' ? subscription : null
    );

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(
      { message: 'Payment verified successfully', payment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
