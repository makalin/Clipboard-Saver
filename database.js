const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      path.join(app.getPath('userData'), 'clipboard.db')
    );
  }

  initialize() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  saveClipboardItem(content) {
    const stmt = this.db.prepare(
      'INSERT INTO clipboard_items (content) VALUES (?)'
    );
    stmt.run(content);
    stmt.finalize();
  }

  getHistory() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM clipboard_items ORDER BY timestamp DESC LIMIT 100',
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  clearHistory() {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM clipboard_items', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = Database;