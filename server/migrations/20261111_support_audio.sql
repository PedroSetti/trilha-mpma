BEGIN;
ALTER TABLE public.study_attachments DROP CONSTRAINT IF EXISTS study_attachments_mime_check;
ALTER TABLE public.study_attachments ADD CONSTRAINT study_attachments_mime_check CHECK (mime IN ('image/jpeg','image/png','image/webp','application/pdf','audio/webm','audio/ogg','audio/mp4','audio/mpeg'));
COMMIT;
