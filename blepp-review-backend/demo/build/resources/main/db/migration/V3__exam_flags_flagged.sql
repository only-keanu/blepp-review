-- Ensure exam_flags has a flagged column and default false for existing rows.
ALTER TABLE exam_flags
    ADD COLUMN IF NOT EXISTS flagged BOOLEAN;

UPDATE exam_flags
SET flagged = false
WHERE flagged IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'exam_flags'
          AND column_name = 'flagged'
          AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE exam_flags
            ALTER COLUMN flagged SET NOT NULL;
    END IF;
END $$;
