-- Ensure project slug has a unique constraint (idempotent).
-- If 001 already created the table with slug UNIQUE, no-op. Otherwise add named constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) AND NOT a.attisdropped
    WHERE c.conrelid = 'project'::regclass AND c.contype = 'u' AND a.attname = 'slug'
  ) THEN
    ALTER TABLE project ADD CONSTRAINT unique_project_slug UNIQUE(slug);
  END IF;
END $$;
