CREATE TABLE IF NOT EXISTS notification_dismissals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_key VARCHAR(255) NOT NULL,
    dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_notification_dismissals_user_key UNIQUE (user_id, notification_key)
);

CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user
    ON notification_dismissals(user_id);
