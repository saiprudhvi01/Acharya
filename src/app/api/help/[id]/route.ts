import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { HelpArticle } from '@/models/FAQ';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const article = await HelpArticle.findById(params.id)
      .populate('author', 'name email avatar')
      .populate('relatedArticles');

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    article.views = (article.views || 0) + 1;
    await article.save();

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching help article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
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

    const article = await HelpArticle.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name email avatar')
      .populate('relatedArticles');

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating help article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
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

    const article = await HelpArticle.findByIdAndDelete(params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting help article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
