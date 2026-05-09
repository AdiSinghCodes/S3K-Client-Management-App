-- S3K Client Governance CRM - Database Schema
-- This script creates all necessary tables for the application

-- Drop database if exists (careful in production!)
DROP DATABASE IF EXISTS s3k_db;

-- Create database
CREATE DATABASE s3k_db;

-- Connect to the database
\c s3k_db

-- ============================================
-- TABLE 1: Users
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'team',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 2: Companies
-- ============================================
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  contract_value DECIMAL(12, 2),
  start_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 3: Company Team Members
-- ============================================
CREATE TABLE company_team_members (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, user_id)
);

-- ============================================
-- TABLE 4: Projects
-- ============================================
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_name VARCHAR(150) NOT NULL,
  completion INTEGER DEFAULT 0,
  phase VARCHAR(50) DEFAULT 'ideation',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 5: Use Cases
-- ============================================
CREATE TABLE use_cases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
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

-- ============================================
-- TABLE 6: Trainings
-- ============================================
CREATE TABLE trainings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
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

-- ============================================
-- TABLE 7: Weekly Reports
-- ============================================
CREATE TABLE weekly_reports (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
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

-- ============================================
-- TABLE 8: Monthly Reviews
-- ============================================
CREATE TABLE monthly_reviews (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
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

-- ============================================
-- TABLE 9: Costs
-- ============================================
CREATE TABLE costs (
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

-- ============================================
-- TABLE 10: Productivity Logs
-- ============================================
CREATE TABLE productivity_logs (
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

-- ============================================
-- TABLE 11: Audit Logs
-- ============================================
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  changes JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_use_cases_project ON use_cases(project_id);
CREATE INDEX idx_trainings_company ON trainings(company_id);
CREATE INDEX idx_reports_company ON weekly_reports(company_id);
CREATE INDEX idx_reviews_company ON monthly_reviews(company_id);
CREATE INDEX idx_costs_company_month ON costs(company_id, month_year);
CREATE INDEX idx_productivity_user_month ON productivity_logs(user_id, month_year);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ============================================
-- INSERT SAMPLE DATA FOR TESTING
-- ============================================
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@s3ktech.com', '$2b$10$dummy_hash_senior_mgmt', 'senior_management'),
('Aditya Singh', 'aditya@s3ktech.com', '$2b$10$dummy_hash_1', 'team'),
('Priya Sharma', 'priya@s3ktech.com', '$2b$10$dummy_hash_2', 'team'),
('Rajesh Kumar', 'rajesh@s3ktech.com', '$2b$10$dummy_hash_3', 'team');

INSERT INTO companies (company_name, industry, contract_value, start_date, status) VALUES
('TechCorp India', 'Software', 50000.00, '2024-01-15', 'active'),
('DataFlow Solutions', 'Data Analytics', 75000.00, '2024-02-01', 'active'),
('CloudNext Systems', 'Cloud Services', 100000.00, '2024-03-10', 'active');

INSERT INTO company_team_members (company_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 2),
(3, 4);

-- ============================================
-- COMPLETE! Database schema created successfully
-- ============================================
