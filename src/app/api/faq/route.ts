import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FAQ } from '@/models/FAQ';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query: any = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } },
      ];
    }

    const faqs = await FAQ.find(query)
      .populate('author', 'name email avatar')
      .populate('relatedQuestions')
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const faq = new FAQ(body);
    await faq.save();

    const populated = await faq.populate([
      { path: 'author', select: 'name email avatar' },
      { path: 'relatedQuestions' },
    ]);

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
