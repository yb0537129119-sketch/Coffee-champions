-- Branch-owned employee roster. Existing Beitar employees and historical data are preserved.
CREATE TABLE IF NOT EXISTS branch_employees (
 branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B','בית שמש רמה א','בית שמש רמה ד','בית שמש נעימי','צפת','תל אביב','קריית ספר','מודיעין','אשדוד ג','אשדוד ז','בני ברק','פתח תקווה','רחובות')),
 employee TEXT NOT NULL CHECK (length(trim(employee)) BETWEEN 2 AND 80),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY (branch, employee)
);
INSERT OR IGNORE INTO branch_employees (branch,employee)
SELECT DISTINCT branch,employee FROM employee_subscriptions;
INSERT OR IGNORE INTO branch_employees (branch,employee)
SELECT DISTINCT branch,employee FROM subscription_receipts;
INSERT OR IGNORE INTO branch_employees (branch,employee) VALUES
 ('ביתר עילית A','יהודה בן גיגי'),
 ('ביתר עילית A','נהוראי מלכה'),
 ('ביתר עילית A','אוריאל דוד פנחסי'),
 ('ביתר עילית A','דביר כהן'),
 ('ביתר עילית A','שמואל שמואלי'),
 ('ביתר עילית A','יצחק סודרי'),
 ('ביתר עילית B','יהודה בן גיגי'),
 ('ביתר עילית B','נהוראי מלכה'),
 ('ביתר עילית B','אוריאל דוד פנחסי'),
 ('ביתר עילית B','דביר כהן'),
 ('ביתר עילית B','שמואל שמואלי'),
 ('ביתר עילית B','יצחק סודרי');
