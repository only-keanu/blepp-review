CREATE TABLE IF NOT EXISTS exam_session_questions (
    id UUID PRIMARY KEY,
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    order_index INTEGER
);
