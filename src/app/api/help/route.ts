import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { HelpArticle } from '@/models/FAQ';

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
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } },
      ];
    }

    const articles = await HelpArticle.find(query)
      .populate('author', 'name email avatar')
      .populate('relatedArticles')
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching help articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/\s+/g, '-');
    }

    const article = new HelpArticle(body);
    await article.save();

    const populated = await article.populate([
      { path: 'author', select: 'name email avatar' },
      { path: 'relatedArticles' },
    ]);

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Error creating help article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
