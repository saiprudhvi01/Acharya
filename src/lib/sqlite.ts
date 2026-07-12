import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use /tmp directory for Render Free tier (data lost on each deployment)
const dbDir = process.env.RENDER ? '/tmp' : path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'acharya.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDB() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      phone TEXT,
      bio TEXT,
      subjects TEXT,
      isVerified INTEGER DEFAULT 0,
      isBlocked INTEGER DEFAULT 0,
      isSuspended INTEGER DEFAULT 0,
      subscriptionPlan TEXT,
      subscriptionStartDate TEXT,
      subscriptionEndDate TEXT,
      subscriptionIsActive INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      skillLevel TEXT NOT NULL,
      price REAL NOT NULL,
      duration INTEGER NOT NULL,
      thumbnail TEXT,
      videoUrl TEXT,
      teacherId INTEGER NOT NULL,
      enrolledStudents INTEGER DEFAULT 0,
      ratings REAL DEFAULT 0,
      reviewsCount INTEGER DEFAULT 0,
      isApproved INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacherId) REFERENCES users(id)
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      courseId INTEGER,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      razorpayOrderId TEXT,
      razorpayPaymentId TEXT,
      razorpaySignature TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      paymentType TEXT NOT NULL,
      subscriptionPlan TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      dueDate TEXT,
      maxMarks INTEGER DEFAULT 100,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Assignment submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignmentId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      content TEXT,
      fileUrl TEXT,
      marks INTEGER,
      submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      gradedAt TEXT,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id),
      FOREIGN KEY (studentId) REFERENCES users(id),
      UNIQUE(assignmentId, studentId)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      courseId INTEGER,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (receiverId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Attendance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      markedBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id),
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (markedBy) REFERENCES users(id),
      UNIQUE(courseId, studentId, date)
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id),
      FOREIGN KEY (studentId) REFERENCES users(id),
      UNIQUE(courseId, studentId)
    )
  `);

  // User course enrollments junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_enrollments (
      userId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      plan TEXT DEFAULT 'basic',
      enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, courseId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // User wishlist junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_wishlist (
      userId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, courseId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Course materials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Certificates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      fileUrl TEXT NOT NULL,
      issuedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(studentId, courseId),
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  // Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId TEXT NOT NULL UNIQUE,
      teacherId INTEGER NOT NULL,
      courseId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      scheduledFor TEXT,
      duration INTEGER,
      status TEXT DEFAULT 'scheduled',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacherId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);
}

// Initialize database on import
initDB();

// Seed database for demo/testing purposes
import './seed';

export default db;
