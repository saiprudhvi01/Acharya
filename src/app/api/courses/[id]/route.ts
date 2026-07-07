import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = db.prepare(`
      SELECT c.*, u.name as teacherName, u.email as teacherEmail, u.avatar as teacherAvatar, u.bio as teacherBio, u.subjects as teacherSubjects
      FROM courses c
      JOIN users u ON c.teacherId = u.id
      WHERE c.id = ?
    `).get(params.id) as any;

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    course.teacherSubjects = course.teacherSubjects ? JSON.parse(course.teacherSubjects) : [];

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update course (teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!teacherId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can update courses.' },
        { status: 403 }
      );
    }

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id) as any;

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== parseInt(teacherId)) {
      return NextResponse.json(
        { error: 'You can only update your own courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subject,
      duration,
      price,
      skillLevel,
      coverImage,
      videos,
      materials,
      liveClasses,
    } = body;

    // Update fields
    const updates: any[] = [];
    const queryParams: any[] = [];

    if (title) {
      updates.push('title = ?');
      queryParams.push(title);
    }
    if (description) {
      updates.push('description = ?');
      queryParams.push(description);
    }
    if (category) {
      updates.push('category = ?');
      queryParams.push(category);
    }
    if (subject) {
      updates.push('subject = ?');
      queryParams.push(subject);
    }
    if (duration) {
      updates.push('duration = ?');
      queryParams.push(duration);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      queryParams.push(price);
    }
    if (skillLevel) {
      updates.push('skillLevel = ?');
      queryParams.push(skillLevel);
    }
    if (coverImage) {
      updates.push('thumbnail = ?');
      queryParams.push(coverImage);
    }

    if (updates.length > 0) {
      queryParams.push(params.id);
      db.prepare(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`).run(...queryParams);
    }

    const updatedCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id);

    return NextResponse.json(
      { message: 'Course updated successfully', course: updatedCourse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE course (teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!teacherId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can delete courses.' },
        { status: 403 }
      );
    }

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id) as any;

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== parseInt(teacherId)) {
      return NextResponse.json(
        { error: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    db.prepare('DELETE FROM courses WHERE id = ?').run(params.id);

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
