-- Expand subscription and receipt storage to all COFFEE CHAMPIONS branches.
-- Existing branch totals and receipt history are copied unchanged.
CREATE TABLE employee_subscriptions_new (
 branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B','בית שמש רמה א','בית שמש רמה ד','בית שמש נעימי','צפת','תל אביב','קריית ספר','מודיעין','אשדוד ג','אשדוד ז','בני ברק','פתח תקווה','רחובות')),
 employee TEXT NOT NULL CHECK (employee IN ('יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן','שמואל שמואלי','יצחק סודרי')),
 subscriptions INTEGER NOT NULL DEFAULT 0 CHECK (subscriptions >= 0 AND subscriptions <= 100000),
 receipt_data TEXT, receipt_type TEXT,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY (branch, employee)
);
INSERT INTO employee_subscriptions_new
 (branch,employee,subscriptions,receipt_data,receipt_type,updated_at)
SELECT branch,employee,subscriptions,receipt_data,receipt_type,updated_at FROM employee_subscriptions;
DROP TABLE employee_subscriptions;
ALTER TABLE employee_subscriptions_new RENAME TO employee_subscriptions;

CREATE TABLE subscription_receipts_new (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B','בית שמש רמה א','בית שמש רמה ד','בית שמש נעימי','צפת','תל אביב','קריית ספר','מודיעין','אשדוד ג','אשדוד ז','בני ברק','פתח תקווה','רחובות')),
 employee TEXT NOT NULL CHECK (employee IN ('יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן','שמואל שמואלי','יצחק סודרי')),
 receipt_data TEXT NOT NULL,
 receipt_type TEXT NOT NULL DEFAULT 'image/jpeg',
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO subscription_receipts_new (id,branch,employee,receipt_data,receipt_type,created_at)
SELECT id,branch,employee,receipt_data,receipt_type,created_at FROM subscription_receipts;
DROP TABLE subscription_receipts;
ALTER TABLE subscription_receipts_new RENAME TO subscription_receipts;
CREATE INDEX idx_subscription_receipts_branch_employee
 ON subscription_receipts(branch,employee,created_at DESC);
