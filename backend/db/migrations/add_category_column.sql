-- Migration: Add category column to it_requests table
-- Date: 2025-10-10

-- Add category column with default value
ALTER TABLE it_requests
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'อื่นๆ';

-- Update existing records to have default category
UPDATE it_requests
SET category = 'อื่นๆ'
WHERE category IS NULL;

-- Add comment to describe the column
COMMENT ON COLUMN it_requests.category IS 'หมวดหมู่คำขอ: ฮาร์ดแวร์, ซอฟต์แวร์, เครือข่าย, อื่นๆ';
