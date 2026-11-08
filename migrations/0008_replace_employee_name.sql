-- Replace the legacy employee name everywhere while preserving subscription totals and receipts.
CREATE TABLE employee_subscriptions_new (
  branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B')),
  employee TEXT NOT NULL CHECK (employee IN ('יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן')),
  subscriptions INTEGER NOT NULL DEFAULT 0 CHECK (subscriptions >= 0 AND subscriptions <= 100000),
  receipt_data TEXT,
  receipt_type TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (branch, employee)
);

INSERT INTO employee_subscriptions_new (branch, employee, subscriptions, receipt_data, receipt_type, updated_at)
SELECT
  branch,
  CASE WHEN employee = 'ישי אלמקייס' THEN 'דביר כהן' ELSE employee END,
  SUM(subscriptions),
  (SELECT old.receipt_data FROM employee_subscriptions old
   WHERE old.branch = grouped.branch AND
     (old.employee = grouped.employee OR old.employee = CASE WHEN grouped.employee = 'דביר כהן' THEN 'ישי אלמקייס' ELSE grouped.employee END)
   ORDER BY old.updated_at DESC LIMIT 1),
  (SELECT old.receipt_type FROM employee_subscriptions old
   WHERE old.branch = grouped.branch AND
     (old.employee = grouped.employee OR old.employee = CASE WHEN grouped.employee = 'דביר כהן' THEN 'ישי אלמקייס' ELSE grouped.employee END)
   ORDER BY old.updated_at DESC LIMIT 1),
  MAX(updated_at)
FROM employee_subscriptions AS grouped
GROUP BY branch, CASE WHEN employee = 'ישי אלמקייס' THEN 'דביר כהן' ELSE employee END;

DROP TABLE employee_subscriptions;
ALTER TABLE employee_subscriptions_new RENAME TO employee_subscriptions;

CREATE TABLE subscription_receipts_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B')),
  employee TEXT NOT NULL CHECK (employee IN ('יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן')),
  receipt_data TEXT NOT NULL,
  receipt_type TEXT NOT NULL DEFAULT 'image/jpeg',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT INTO subscription_receipts_new (id, branch, employee, receipt_data, receipt_type, created_at)
SELECT id, branch,
  CASE WHEN employee = 'ישי אלמקייס' THEN 'דביר כהן' ELSE employee END,
  receipt_data, receipt_type, created_at
FROM subscription_receipts;

DROP TABLE subscription_receipts;
ALTER TABLE subscription_receipts_new RENAME TO subscription_receipts;
CREATE INDEX idx_subscription_receipts_branch_employee
  ON subscription_receipts(branch, employee, created_at DESC);
