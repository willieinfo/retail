// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// ✅ Start your backend Express app
require(path.join(__dirname, 'BackEnd', 'mainApp.js'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,   // keep frontend like browser
      contextIsolation: true,   // safer
    }
  });


  // ✅ Load your existing frontend
  win.loadFile(path.join(__dirname, 'RetailApp.html'));
  win.maximize();
  if (process.platform !== 'darwin') {
    // win.setMenu(null);
  }

  // win.webContents.send('message', 'Hello from main process!');
  // Optional: Open DevTools automatically
  win.webContents.openDevTools();
}

app.whenReady().then(() => {

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception in Main Process:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection in Main Process:', reason);
});
