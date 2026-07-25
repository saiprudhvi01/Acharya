import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'all', 'courses', 'students', 'teachers', 'materials'
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const skillLevel = searchParams.get('skillLevel');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const materialType = searchParams.get('materialType'); // 'pdf', 'video', 'all'

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results: any = {
      courses: [],
      students: [],
      teachers: [],
      materials: [],
    };

    // Search courses
    if (type === 'all' || type === 'courses') {
      let courseQuery = `
        SELECT c.*, u.name as teacherName, u.email as teacherEmail, u.avatar as teacherAvatar 
        FROM courses c 
        JOIN users u ON c.teacherId = u.id 
        WHERE c.isApproved = 1 
        AND (c.title LIKE ? OR c.description LIKE ? OR c.subject LIKE ? OR c.category LIKE ?)
      `;
      const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

      if (category) {
        courseQuery += ' AND c.category = ?';
        params.push(category);
      }
      if (subject) {
        courseQuery += ' AND c.subject = ?';
        params.push(subject);
      }
      if (skillLevel) {
        courseQuery += ' AND c.skillLevel = ?';
        params.push(skillLevel);
      }
      if (minPrice) {
        courseQuery += ' AND c.price >= ?';
        params.push(parseFloat(minPrice));
      }
      if (maxPrice) {
        courseQuery += ' AND c.price <= ?';
        params.push(parseFloat(maxPrice));
      }

      courseQuery += ' LIMIT 20';

      results.courses = db.prepare(courseQuery).all(...params);
    }

    // Search students
    if (type === 'all' || type === 'students') {
      const studentQuery = `
        SELECT id, name, email, role, avatar, phone, bio, isVerified, isBlocked, isSuspended, createdAt, updatedAt
        FROM users 
        WHERE role = 'student' 
        AND (name LIKE ? OR email LIKE ?)
        LIMIT 20
      `;
      results.students = db.prepare(studentQuery).all(`%${query}%`, `%${query}%`);
    }

    // Search teachers with availability
    if (type === 'all' || type === 'teachers') {
      const teacherQuery = `
        SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, 
               channelUrl, hourlyRate, isAvailable, availabilityHours, createdAt, updatedAt
        FROM users 
        WHERE role = 'teacher' 
        AND (name LIKE ? OR email LIKE ? OR subjects LIKE ? OR bio LIKE ?)
        LIMIT 20
      `;
      results.teachers = db.prepare(teacherQuery).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }

    // Search materials (PDFs and videos)
    if (type === 'all' || type === 'materials') {
      let materialQuery = `
        SELECT cm.*, c.title as courseTitle, c.subject, c.category, c.skillLevel, 
               u.name as teacherName, u.id as teacherId
        FROM course_materials cm
        JOIN courses c ON cm.courseId = c.id
        JOIN users u ON c.teacherId = u.id
        WHERE c.isApproved = 1
        AND (cm.title LIKE ? OR c.title LIKE ? OR c.subject LIKE ? OR c.category LIKE ?)
      `;
      const materialParams: any[] = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

      if (materialType && materialType !== 'all') {
        materialQuery += ' AND cm.type = ?';
        materialParams.push(materialType);
      }

      materialQuery += ' LIMIT 30';

      results.materials = db.prepare(materialQuery).all(...materialParams);
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
