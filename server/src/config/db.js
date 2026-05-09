import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 's3k_db',
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Function to connect and test
export async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Function to run raw SQL
export async function runQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

// Function to initialize database with all tables
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'team',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create companies table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        industry VARCHAR(100),
        contract_value DECIMAL(12, 2),
        start_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Companies table created');

    // Create company_team_members table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS company_team_members (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, user_id)
      );
    `);
    console.log('✅ Company Team Members table created');

    // Create projects table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        project_name VARCHAR(150) NOT NULL,
        completion INTEGER DEFAULT 0,
        phase VARCHAR(50) DEFAULT 'ideation',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Projects table created');

    // Create use_cases table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS use_cases (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        use_case_name VARCHAR(200) NOT NULL,
        phase_ideation BOOLEAN DEFAULT FALSE,
        phase_design BOOLEAN DEFAULT FALSE,
        phase_development BOOLEAN DEFAULT FALSE,
        phase_uat BOOLEAN DEFAULT FALSE,
        phase_live BOOLEAN DEFAULT FALSE,
        go_live_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Use Cases table created');

    // Create trainings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        training_name VARCHAR(200) NOT NULL,
        trainer VARCHAR(100),
        training_date DATE NOT NULL,
        duration_hours INTEGER,
        participants INTEGER,
        topic VARCHAR(200),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'scheduled',
        value DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Trainings table created');

    // Create weekly_reports table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        week_start_date DATE NOT NULL,
        subject VARCHAR(200),
        body TEXT,
        achievements TEXT,
        challenges TEXT,
        blockers TEXT,
        next_week_plan TEXT,
        client_feedback TEXT,
        assistance_needed TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        sent_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Weekly Reports table created');

    // Create monthly_reviews table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS monthly_reviews (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        review_date DATE NOT NULL,
        client_name VARCHAR(150),
        meeting_date DATE,
        attendees VARCHAR(500),
        highlights TEXT,
        discussions TEXT,
        ctas TEXT,
        risks TEXT,
        next_meeting_date DATE,
        mom_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Monthly Reviews table created');

    // Create costs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS costs (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        month_year DATE NOT NULL,
        revenue DECIMAL(15, 2),
        travel_cost DECIMAL(15, 2) DEFAULT 0,
        license_cost DECIMAL(15, 2) DEFAULT 0,
        freelancer_cost DECIMAL(15, 2) DEFAULT 0,
        fte_cost DECIMAL(15, 2) DEFAULT 0,
        part_time_india_cost DECIMAL(15, 2) DEFAULT 0,
        part_time_us_cost DECIMAL(15, 2) DEFAULT 0,
        total_cost DECIMAL(15, 2),
        gross_margin DECIMAL(15, 2),
        gm_percentage DECIMAL(8, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Costs table created');

    // Create productivity_logs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS productivity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        month_year DATE NOT NULL,
        tasks_completed INTEGER DEFAULT 0,
        tasks_target INTEGER DEFAULT 0,
        reports_submitted INTEGER DEFAULT 0,
        reports_target INTEGER DEFAULT 0,
        milestones_achieved INTEGER DEFAULT 0,
        use_cases_updated INTEGER DEFAULT 0,
        productivity_score DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Productivity Logs table created');

    // Create audit_logs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        changes JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Audit Logs table created');

    console.log('\n✅ All tables created successfully!\n');

    // Run database migrations
    try {
      console.log('🔄 Running database migrations...');
      
      // Add reviewer_name column if it doesn't exist
      await runQuery(`
        ALTER TABLE monthly_reviews
        ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(150);
      `);
      console.log('✅ reviewer_name column added/verified');

      // Add member_name column to productivity_logs if it doesn't exist
      await runQuery(`
        ALTER TABLE productivity_logs
        ADD COLUMN IF NOT EXISTS member_name VARCHAR(150);
      `);
      console.log('✅ member_name column added to productivity_logs');

      // Drop unused columns
      await runQuery(`
        ALTER TABLE monthly_reviews
        DROP COLUMN IF EXISTS client_name;
      `);
      console.log('✅ Dropped client_name column');

      await runQuery(`
        ALTER TABLE monthly_reviews
        DROP COLUMN IF EXISTS meeting_date;
      `);
      console.log('✅ Dropped meeting_date column');

      await runQuery(`
        ALTER TABLE monthly_reviews
        DROP COLUMN IF EXISTS attendees;
      `);
      console.log('✅ Dropped attendees column');

      await runQuery(`
        ALTER TABLE monthly_reviews
        DROP COLUMN IF EXISTS discussions;
      `);
      console.log('✅ Dropped discussions column');

      await runQuery(`
        ALTER TABLE monthly_reviews
        DROP COLUMN IF EXISTS next_meeting_date;
      `);
      console.log('✅ Dropped next_meeting_date column');

      // Add user_id column to companies if it doesn't exist (for tracking who created the client)
      await runQuery(`
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      `);
      console.log('✅ user_id column added/verified for companies table');

      // Add company_detail column to companies if it doesn't exist
      await runQuery(`
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS company_detail TEXT;
      `);
      console.log('✅ company_detail column added/verified for companies table');

      console.log('✅ Database migrations completed successfully!\n');
    } catch (migrationError) {
      console.log('ℹ️  Migration info:', migrationError.message);
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

export { pool };
export default pool;
