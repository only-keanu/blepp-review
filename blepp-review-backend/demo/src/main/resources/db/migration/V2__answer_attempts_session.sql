-- Add practice_session_id and backfill from the earliest session for the same user (if any).
ALTER TABLE answer_attempts
    ADD COLUMN IF NOT EXISTS practice_session_id UUID;

UPDATE answer_attempts aa
SET practice_session_id = (
    SELECT ps.id
    FROM practice_sessions ps
    WHERE ps.user_id = aa.user_id
    ORDER BY ps.created_at ASC
    LIMIT 1
)
WHERE practice_session_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_answer_attempts_session'
          AND table_name = 'answer_attempts'
    ) THEN
        ALTER TABLE answer_attempts
            ADD CONSTRAINT fk_answer_attempts_session
            FOREIGN KEY (practice_session_id) REFERENCES practice_sessions(id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'answer_attempts'
          AND column_name = 'practice_session_id'
          AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE answer_attempts
            ALTER COLUMN practice_session_id SET NOT NULL;
    END IF;
END $$;
