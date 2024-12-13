// package.json
{
  "name": "clipboard-saver",
  "version": "1.0.0",
  "description": "A system tray clipboard history manager",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "electron": "^25.0.0",
    "electron-builder": "^24.6.0"
  }
}

// main.js
const { app, BrowserWindow, Tray, Menu, clipboard, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database');

let tray = null;
let mainWindow = null;
let db = null;

// Initialize database
function initializeApp() {
  db = new Database();
  db.initialize();
}

// Create the system tray icon and menu
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show History', click: showMainWindow },
    { label: 'Clear History', click: clearHistory },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Clipboard Saver');
  tray.setContextMenu(contextMenu);
}

// Create the main window for clipboard history
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function showMainWindow() {
  mainWindow.show();
  mainWindow.focus();
}

// Monitor clipboard changes
let lastClipboardContent = '';
function monitorClipboard() {
  setInterval(() => {
    const content = clipboard.readText();
    if (content && content !== lastClipboardContent) {
      lastClipboardContent = content;
      db.saveClipboardItem(content);
    }
  }, 500);
}

function clearHistory() {
  db.clearHistory();
  if (mainWindow) {
    mainWindow.webContents.send('history-cleared');
  }
}

// IPC handlers
ipcMain.on('get-clipboard-history', async (event) => {
  const history = await db.getHistory();
  event.reply('clipboard-history', history);
});

ipcMain.on('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
});

app.whenReady().then(() => {
  initializeApp();
  createTray();
  createMainWindow();
  monitorClipboard();
  
  // Register global shortcut to show window
  globalShortcut.register('CommandOrControl+Shift+V', showMainWindow);
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// database.js
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

// index.html
<!DOCTYPE html>
<html>
<head>
  <title>Clipboard History</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    
    .search-container {
      margin-bottom: 20px;
    }
    
    #searchInput {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .clipboard-item {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .clipboard-item:hover {
      background-color: #f0f0f0;
    }
    
    .timestamp {
      color: #666;
      font-size: 12px;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="search-container">
    <input type="text" id="searchInput" placeholder="Search clipboard history...">
  </div>
  <div id="clipboardHistory"></div>

  <script>
    const { ipcRenderer } = require('electron');
    
    // Request initial history
    ipcRenderer.send('get-clipboard-history');
    
    // Handle clipboard history updates
    ipcRenderer.on('clipboard-history', (event, items) => {
      displayHistory(items);
    });
    
    // Handle history clear
    ipcRenderer.on('history-cleared', () => {
      document.getElementById('clipboardHistory').innerHTML = '';
    });
    
    function displayHistory(items) {
      const container = document.getElementById('clipboardHistory');
      container.innerHTML = '';
      
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'clipboard-item';
        div.onclick = () => {
          ipcRenderer.send('copy-to-clipboard', item.content);
        };
        
        div.innerHTML = `
          <div class="content">${escapeHtml(item.content)}</div>
          <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
        `;
        
        container.appendChild(div);
      });
    }
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const items = document.getElementsByClassName('clipboard-item');
      
      Array.from(items).forEach(item => {
        const content = item.querySelector('.content').textContent.toLowerCase();
        item.style.display = content.includes(searchTerm) ? 'block' : 'none';
      });
    });
    
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>
