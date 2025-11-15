-- Add VideoQuality enum
CREATE TYPE "VideoQuality" AS ENUM ('POOR', 'GOOD', 'EXCELLENT');

-- Add video feedback fields to work_logs table
ALTER TABLE "work_logs"
ADD COLUMN IF NOT EXISTS "videoQuality" "VideoQuality",
ADD COLUMN IF NOT EXISTS "feedbackNote" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackBy" TEXT,
ADD COLUMN IF NOT EXISTS "feedbackAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "feedbackSeen" BOOLEAN NOT NULL DEFAULT false;

-- Add comments
COMMENT ON COLUMN "work_logs"."videoQuality" IS 'Manager feedback: POOR (Không đạt), GOOD (Đạt), EXCELLENT (Tốt)';
COMMENT ON COLUMN "work_logs"."feedbackNote" IS 'Manager note for video feedback';
COMMENT ON COLUMN "work_logs"."feedbackBy" IS 'Manager employee ID who gave feedback';
COMMENT ON COLUMN "work_logs"."feedbackAt" IS 'Timestamp when feedback was given';
COMMENT ON COLUMN "work_logs"."feedbackSeen" IS 'Whether employee has seen this feedback';

