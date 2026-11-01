CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch TEXT NOT NULL,
  employee TEXT NOT NULL,
  subscriptions INTEGER NOT NULL CHECK(subscriptions > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);
CREATE TABLE IF NOT EXISTS targets (
  branch TEXT PRIMARY KEY,
  target INTEGER NOT NULL CHECK(target > 0)
);