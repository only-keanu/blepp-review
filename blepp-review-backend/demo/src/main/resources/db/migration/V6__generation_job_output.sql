ALTER TABLE generation_jobs
    ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50),
    ADD COLUMN IF NOT EXISTS topic_id UUID,
    ADD COLUMN IF NOT EXISTS source_label VARCHAR(255),
    ADD COLUMN IF NOT EXISTS generated_questions_json TEXT,
    ADD COLUMN IF NOT EXISTS error_message TEXT;
