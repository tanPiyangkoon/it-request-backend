-- Initial database schema for IT Request System
-- Run this first to create all tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create it_requests table
CREATE TABLE IF NOT EXISTS it_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'อื่นๆ',
    image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (CHANGE PASSWORDS IN PRODUCTION!)
INSERT INTO users (user_id, name, role, email, password) VALUES
    ('u001', 'User 1', 'user', 'user1@example.com', 'user123'),
    ('u002', 'User 2', 'user', 'user2@example.com', 'user456'),
    ('admin', 'Admin', 'admin', 'admin@example.com', 'admin123')
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_it_requests_status ON it_requests(status);
CREATE INDEX IF NOT EXISTS idx_it_requests_created_at ON it_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_it_requests_employee_id ON it_requests(employee_id);

-- Add comments
COMMENT ON TABLE users IS 'System users with roles (user or admin)';
COMMENT ON TABLE it_requests IS 'IT support requests submitted by users';
COMMENT ON COLUMN it_requests.category IS 'Category: ฮาร์ดแวร์, ซอฟต์แวร์, เครือข่าย, อื่นๆ';
COMMENT ON COLUMN it_requests.status IS 'Status: pending, done, rejected';
