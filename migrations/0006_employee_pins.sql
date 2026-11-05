CREATE TABLE IF NOT EXISTS employee_access (
 branch TEXT NOT NULL,
 employee TEXT NOT NULL,
 pin_salt TEXT NOT NULL,
 pin_hash TEXT NOT NULL,
 PRIMARY KEY(branch,employee)
);
CREATE TABLE IF NOT EXISTS employee_sessions (
 token_hash TEXT PRIMARY KEY,
 branch TEXT NOT NULL,
 employee TEXT NOT NULL,
 expires_at TEXT NOT NULL
);
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית A','יהודה בן גיגי','6acd565ce6e0c752e9d8f49446d8abf6','865d30f50ea5eab86c6fd52152a81a067db29947a9726a0fc850e3cf58761b0f') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית A','נהוראי מלכה','fd0fe99606c516b9292283dba2bf974c','2ff9ab5f2cc458dbb2a5656e60f0292a42926a2029de0853763fc5a7ba58f575') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית A','אוריאל דוד פנחסי','e186ccb9f79d5c270a20ed7fd3ea99f9','50c12e869a678fad29d2d91007de48f826bfdcab758c7bf543dff34e27c5e1b2') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית A','ישי אלמקייס','658bd2db8b7e37f349e39e19060edcaa','f87a4829bc5389972ee9ac2f046c498e856d989288da89dad90e30561ec9c0b8') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית B','יהודה בן גיגי','0bcfe2c4b74b97bba4a311df368a9072','8faace967bc56c28b5c89c59a432fd7ec493bb68a5f9e59656c9ab55645c01c1') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית B','נהוראי מלכה','9e4c350e7711e9358d8472ed263b6838','7c85a285946f2bca3cecb834762fd3008d6f35812b45f66ef60c7abdb0aa4b82') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית B','אוריאל דוד פנחסי','e3424fc6a305c4c8d188db64dff5e468','fe33a40c26d01dd709e4c3755033da0e8c8ae5f731ce9e76aaac04fa4e96aa8a') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
INSERT INTO employee_access(branch,employee,pin_salt,pin_hash) VALUES('ביתר עילית B','ישי אלמקייס','b9608510226f64623fbf8c26bc5a39f0','6f78e23972f3f90fe4d0d7ba7624cb76366351760715f01411befcf3d13503ea') ON CONFLICT(branch,employee) DO UPDATE SET pin_salt=excluded.pin_salt,pin_hash=excluded.pin_hash;
