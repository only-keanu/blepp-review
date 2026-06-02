ALTER TABLE exam_sessions
    ALTER COLUMN mock_exam_id DROP NOT NULL;

ALTER TABLE exam_sessions
    ADD COLUMN IF NOT EXISTS total_questions INTEGER;

ALTER TABLE exam_sessions
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
