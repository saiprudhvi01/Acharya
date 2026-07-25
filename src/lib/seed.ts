import db from './sqlite';
import bcrypt from 'bcryptjs';

export function seedDatabase() {
  try {
    const email = 'acharya@acharya.com';
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 12);
      db.prepare(`
        INSERT INTO users (name, email, password, role, isVerified)
        VALUES (?, ?, ?, ?, ?)
      `).run('Acharya Admin', email, hashedPassword, 'admin', 1);

      console.log('✅ Admin user created: acharya@acharya.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('✅ Admin user already exists (constraint handled)');
      return;
    }

    console.error('❌ Error seeding database:', error);
  }
}

// Auto-seed on import
seedDatabase();
