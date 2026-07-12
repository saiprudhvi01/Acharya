import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FAQ } from '@/models/FAQ';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    

    const body = await request.json();
    const { type } = body; // 'helpful' or 'notHelpful'

    const faq = await FAQ.findByIdAndUpdate(
      params.id,
      type === 'helpful'
        ? { $inc: { helpful: 1 } }
        : { $inc: { notHelpful: 1 } },
      { new: true }
    );

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
