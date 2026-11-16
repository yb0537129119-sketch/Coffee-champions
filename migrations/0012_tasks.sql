CREATE TABLE IF NOT EXISTS tasks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL CHECK(length(title) BETWEEN 2 AND 120),
 details TEXT NOT NULL DEFAULT '',
 branch TEXT NOT NULL CHECK(branch IN ('ביתר עילית A','ביתר עילית B','כללי')),
 assignee TEXT NOT NULL DEFAULT '',
 priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high')),
 due_date TEXT,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','done')),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tasks_branch_status_due ON tasks(branch,status,due_date);
