import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { HelpArticle } from '@/models/FAQ';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    

    const body = await request.json();
    const { type } = body; // 'helpful' or 'notHelpful'

    const article = await HelpArticle.findByIdAndUpdate(
      params.id,
      type === 'helpful'
        ? { $inc: { helpful: 1 } }
        : { $inc: { notHelpful: 1 } },
      { new: true }
    );

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
