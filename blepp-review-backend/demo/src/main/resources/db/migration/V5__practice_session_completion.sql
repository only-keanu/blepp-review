ALTER TABLE practice_sessions
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS score INTEGER;

CREATE TABLE IF NOT EXISTS practice_session_questions (
    id UUID PRIMARY KEY,
    practice_session_id UUID NOT NULL,
    question_id UUID NOT NULL,
    order_index INTEGER,
    CONSTRAINT fk_practice_session_questions_session
        FOREIGN KEY (practice_session_id) REFERENCES practice_sessions(id),
    CONSTRAINT fk_practice_session_questions_question
        FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE INDEX IF NOT EXISTS idx_practice_session_questions_session
    ON practice_session_questions(practice_session_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_session_questions_unique_question
    ON practice_session_questions(practice_session_id, question_id);
