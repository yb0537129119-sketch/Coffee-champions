CREATE TABLE IF NOT EXISTS task_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 task_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 branch TEXT NOT NULL,
 completed_by TEXT NOT NULL DEFAULT '',
 completed_at TEXT NOT NULL,
 reopened_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_task_history_task_completed ON task_history(task_id, completed_at);