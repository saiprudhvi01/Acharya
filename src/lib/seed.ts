import db from './sqlite';
import bcrypt from 'bcryptjs';

export function seedDatabase() {
  try {
    // Check if admin user exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('acharya@acharya.com');
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = bcrypt.hashSync('admin123', 12);
      db.prepare(`
        INSERT INTO users (name, email, password, role, isVerified)
        VALUES (?, ?, ?, ?, ?)
      `).run('Acharya Admin', 'acharya@acharya.com', hashedPassword, 'admin', 1);
      
      console.log('✅ Admin user created: acharya@acharya.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Auto-seed on import
seedDatabase();
