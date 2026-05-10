const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/data.db');
const db = new Database(dbPath);

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      business_license TEXT,
      license_number TEXT,
      status TEXT DEFAULT 'pending',
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      salary_min INTEGER NOT NULL,
      salary_max INTEGER NOT NULL,
      location TEXT,
      responsibilities TEXT,
      requirements TEXT,
      benefits TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      education TEXT,
      experience TEXT,
      skills TEXT,
      resume_file TEXT,
      status TEXT DEFAULT 'pending',
      is_favorite INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      interview_time TEXT,
      location TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resume_id) REFERENCES resumes(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  console.log('Database initialized');
}

initDatabase();

module.exports = db;
