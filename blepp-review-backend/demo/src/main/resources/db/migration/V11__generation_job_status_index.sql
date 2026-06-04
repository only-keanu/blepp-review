CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_status_created_at
    ON generation_jobs(user_id, status, created_at DESC);
