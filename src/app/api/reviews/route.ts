import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Course from '@/models/Course';
import User from '@/models/User';

// GET reviews for a course
export async function GET(request: NextRequest) {
  try {
    

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ course: courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create review (student only)
export async function POST(request: NextRequest) {
  try {
    

    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized. Only students can submit reviews.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { course, rating, comment } = body;

    // Validation
    if (!course || !rating || !comment) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(course as any)) {
      return NextResponse.json(
        { error: 'You must be enrolled in the course to submit a review' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({ course, student: userId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      course,
      student: userId,
      rating,
      comment,
    });

    // Update course rating
    const courseDoc = await Course.findById(course);
    if (courseDoc) {
      const allReviews = await Review.find({ course });
      const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      courseDoc.ratings = Math.round(avgRating * 10) / 10;
      courseDoc.reviewsCount = allReviews.length;
      await courseDoc.save();
    }

    const populatedReview = await Review.findById(review._id).populate('student', 'name avatar');

    return NextResponse.json(
      { message: 'Review submitted successfully', review: populatedReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
