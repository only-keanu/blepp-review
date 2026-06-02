CREATE INDEX IF NOT EXISTS idx_questions_owner
    ON questions(owner_id);

CREATE INDEX IF NOT EXISTS idx_questions_owner_topic
    ON questions(owner_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_questions_created_at
    ON questions(created_at);

CREATE INDEX IF NOT EXISTS idx_answer_attempts_user_created_at
    ON answer_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_answer_attempts_user_correct_created_at
    ON answer_attempts(user_id, correct, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_answer_attempts_user_question
    ON answer_attempts(user_id, question_id);

CREATE INDEX IF NOT EXISTS idx_answer_attempts_practice_session_created_at
    ON answer_attempts(practice_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_created_at
    ON practice_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_started_at
    ON exam_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_session_questions_session_order
    ON exam_session_questions(exam_session_id, order_index);

CREATE INDEX IF NOT EXISTS idx_exam_session_questions_session_question
    ON exam_session_questions(exam_session_id, question_id);

CREATE INDEX IF NOT EXISTS idx_exam_answers_session_question
    ON exam_answers(exam_session_id, question_id);

CREATE INDEX IF NOT EXISTS idx_exam_flags_session_question
    ON exam_flags(exam_session_id, question_id);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_next_review
    ON flashcards(user_id, next_review);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_confidence
    ON flashcards(user_id, confidence);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_topic
    ON lesson_progress(user_id, topic_slug);

CREATE INDEX IF NOT EXISTS idx_user_topics_user_topic
    ON user_topics(user_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_created_at
    ON generation_jobs(user_id, created_at DESC);
