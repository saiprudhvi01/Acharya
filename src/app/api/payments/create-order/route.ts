import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, courseId, subscription } = body;

    // Validation
    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Please provide amount and type' },
        { status: 400 }
      );
    }

    if (type === 'course' && !courseId) {
      return NextResponse.json(
        { error: 'Course ID is required for course purchase' },
        { status: 400 }
      );
    }

    if (type === 'subscription' && !subscription) {
      return NextResponse.json(
        { error: 'Subscription plan is required' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        type,
        courseId: courseId || '',
        subscription: subscription || '',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
