-- Migration: Add Teams and Manager Role
-- Adds MANAGER role, Team table, and work assignment tracking

-- 1. Add MANAGER to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAGER';

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS "teams" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "managerId" TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add teamId to employees table
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "teamId" TEXT;

-- 4. Add assignedById to work_logs table
ALTER TABLE "work_logs" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;

-- 5. Add foreign key constraints
ALTER TABLE "employees"
  ADD CONSTRAINT "employees_teamId_fkey"
  FOREIGN KEY ("teamId")
  REFERENCES "teams"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "teams"
  ADD CONSTRAINT "teams_managerId_fkey"
  FOREIGN KEY ("managerId")
  REFERENCES "employees"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "work_logs"
  ADD CONSTRAINT "work_logs_assignedById_fkey"
  FOREIGN KEY ("assignedById")
  REFERENCES "employees"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS "employees_teamId_idx" ON "employees"("teamId");
CREATE INDEX IF NOT EXISTS "work_logs_assignedById_idx" ON "work_logs"("assignedById");
CREATE INDEX IF NOT EXISTS "teams_managerId_idx" ON "teams"("managerId");
