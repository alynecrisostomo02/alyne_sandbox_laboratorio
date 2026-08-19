CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_updated_at_idx ON properties(updated_at DESC);
