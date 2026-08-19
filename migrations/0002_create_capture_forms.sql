CREATE TABLE IF NOT EXISTS capture_forms (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'draft',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS capture_forms_status_idx
ON capture_forms(status);

CREATE INDEX IF NOT EXISTS capture_forms_updated_at_idx
ON capture_forms(updated_at DESC);
