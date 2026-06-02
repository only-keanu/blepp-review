CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    target_exam_date DATE,
    daily_study_hours INTEGER,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_topics (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    weak BOOLEAN NOT NULL,
    mastery_pct INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES topics(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    correct_answer_index INTEGER NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS question_choices (
    question_id UUID NOT NULL REFERENCES questions(id),
    choices VARCHAR(255) NOT NULL,
    choice_index INTEGER NOT NULL,
    PRIMARY KEY (question_id, choice_index)
);

CREATE TABLE IF NOT EXISTS question_tags (
    question_id UUID NOT NULL REFERENCES questions(id),
    tags VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    difficulty VARCHAR(255),
    question_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER
);

CREATE TABLE IF NOT EXISTS practice_session_questions (
    id UUID PRIMARY KEY,
    practice_session_id UUID NOT NULL REFERENCES practice_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    order_index INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_session_questions_unique_question
    ON practice_session_questions(practice_session_id, question_id);

CREATE TABLE IF NOT EXISTS answer_attempts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    practice_session_id UUID NOT NULL REFERENCES practice_sessions(id),
    selected_answer_index INTEGER,
    correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    front VARCHAR(255),
    back VARCHAR(255),
    category VARCHAR(255),
    confidence VARCHAR(255),
    next_review DATE,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE,
    total_time_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS study_plan_items (
    id UUID PRIMARY KEY,
    study_plan_id UUID NOT NULL REFERENCES study_plans(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    task_type VARCHAR(255),
    count INTEGER,
    completed BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    topic_slug VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_lesson_progress_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS mock_exams (
    id UUID PRIMARY KEY,
    topic_id UUID REFERENCES topics(id),
    title VARCHAR(255),
    total_questions INTEGER,
    duration_minutes INTEGER,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    mock_exam_id UUID NOT NULL REFERENCES mock_exams(id),
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    time_taken_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS exam_session_questions (
    id UUID PRIMARY KEY,
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    order_index INTEGER
);

CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID PRIMARY KEY,
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    selected_answer_index INTEGER,
    correct BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_flags (
    id UUID PRIMARY KEY,
    exam_session_id UUID NOT NULL REFERENCES exam_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    flagged BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    upload_path VARCHAR(255),
    status VARCHAR(255),
    model VARCHAR(255),
    question_count INTEGER,
    difficulty VARCHAR(50),
    topic_id UUID,
    source_label VARCHAR(255),
    generated_questions_json TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);
