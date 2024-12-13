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