CREATE TABLE IF NOT EXISTS study_attachments (
 id text PRIMARY KEY,
 message_id bigint UNIQUE NOT NULL REFERENCES study_messages(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 160),
 mime text NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp','application/pdf')),
 size integer NOT NULL CHECK(size BETWEEN 1 AND 3145728),
 content bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(octet_length(content)=size)
);
CREATE TABLE IF NOT EXISTS study_message_reads (
 user_id text NOT NULL,
 thread_user_id text NOT NULL,
 last_read_id bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,thread_user_id)
);
CREATE INDEX IF NOT EXISTS study_messages_thread_id_idx ON study_messages(thread_user_id,id DESC);
