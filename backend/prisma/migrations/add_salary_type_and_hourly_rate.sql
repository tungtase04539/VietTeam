-- Add SalaryType enum
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'MONTHLY');

-- Add columns to employees table
ALTER TABLE "employees"
ADD COLUMN "salaryType" "SalaryType" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "hourlyRate" DOUBLE PRECISION;

-- Add comment for clarity
COMMENT ON COLUMN "employees"."salaryType" IS 'HOURLY: tính công theo giờ, MONTHLY: lương tháng cố định';
COMMENT ON COLUMN "employees"."hourlyRate" IS 'Đơn giá giờ (VND) - chỉ dùng khi salaryType = HOURLY';
COMMENT ON COLUMN "employees"."salary" IS 'Lương tháng (VND) - chỉ dùng khi salaryType = MONTHLY';

