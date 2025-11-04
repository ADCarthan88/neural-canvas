import pool from './connection.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  try {
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), '..', 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created');

    // Create admin user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await pool.query(
      'INSERT INTO users (username, email, password_hash, subscription_tier) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['admin', 'admin@demo.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin user created');

    console.log('🚀 Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();