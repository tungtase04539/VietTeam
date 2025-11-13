-- Migration: Allow multiple check-ins per day
-- Remove unique constraint on (employeeId, date) to allow multiple attendance records per day

-- Drop the unique constraint
ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "attendances_employeeId_date_key";

-- Note: Employees can now have multiple check-in/check-out sessions per day
-- Total hours will be calculated by summing all sessions
