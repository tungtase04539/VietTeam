-- Add video fields to work_logs table
ALTER TABLE "work_logs"
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "videoFileId" TEXT,
ADD COLUMN "videoFileName" TEXT;

-- Add comments
COMMENT ON COLUMN "work_logs"."videoUrl" IS 'Google Drive shareable link to video';
COMMENT ON COLUMN "work_logs"."videoFileId" IS 'Google Drive file ID';
COMMENT ON COLUMN "work_logs"."videoFileName" IS 'Original uploaded filename';

