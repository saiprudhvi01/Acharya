import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FAQ } from '@/models/FAQ';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const faq = await FAQ.findById(params.id)
      .populate('author', 'name email avatar')
      .populate('relatedQuestions');

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Increment view count
    faq.views = (faq.views || 0) + 1;
    await faq.save();

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    const faq = await FAQ.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name email avatar')
      .populate('relatedQuestions');

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const faq = await FAQ.findByIdAndDelete(params.id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
