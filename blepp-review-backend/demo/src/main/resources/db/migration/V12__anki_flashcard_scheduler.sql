ALTER TABLE flashcards
    ADD COLUMN IF NOT EXISTS review_state VARCHAR(32) NOT NULL DEFAULT 'NEW',
    ADD COLUMN IF NOT EXISTS due_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS interval_days INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ease_factor INTEGER NOT NULL DEFAULT 2500,
    ADD COLUMN IF NOT EXISTS repetition_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lapse_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE;

UPDATE flashcards
SET review_state = CASE
        WHEN next_review IS NULL THEN 'NEW'
        ELSE 'REVIEW'
    END,
    due_at = CASE
        WHEN next_review IS NULL THEN NULL
        ELSE next_review
    END,
    interval_days = COALESCE(interval_days, 0),
    ease_factor = COALESCE(ease_factor, 2500),
    repetition_count = COALESCE(repetition_count, 0),
    lapse_count = COALESCE(lapse_count, 0)
WHERE review_state IS NULL
   OR due_at IS NULL
   OR interval_days IS NULL
   OR ease_factor IS NULL
   OR repetition_count IS NULL
   OR lapse_count IS NULL;

CREATE INDEX IF NOT EXISTS idx_flashcards_user_due_at
    ON flashcards(user_id, due_at);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_review_state_due_at
    ON flashcards(user_id, review_state, due_at);
