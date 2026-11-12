-- Keep a small tombstone/event log so all connected clients can replay removals.
-- Message contents and attachment bytes are cleared by the authenticated API,
-- only when their author explicitly requests deletion.
CREATE TABLE IF NOT EXISTS study_message_deletions (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL UNIQUE REFERENCES study_messages(id) ON DELETE CASCADE,
  deleted_by TEXT NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
