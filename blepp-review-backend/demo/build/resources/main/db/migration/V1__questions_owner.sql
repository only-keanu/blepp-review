-- Ensure questions have an owner_id and backfill from the first user.
ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS owner_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users) THEN
        INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000001', 'system@local', 'SYSTEM', 'System User', NOW(), NOW());
    END IF;
END $$;

UPDATE questions
SET owner_id = (SELECT id FROM users LIMIT 1)
WHERE owner_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_questions_owner'
          AND table_name = 'questions'
    ) THEN
        ALTER TABLE questions
            ADD CONSTRAINT fk_questions_owner
            FOREIGN KEY (owner_id) REFERENCES users(id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'questions'
          AND column_name = 'owner_id'
          AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE questions
            ALTER COLUMN owner_id SET NOT NULL;
    END IF;
END $$;
