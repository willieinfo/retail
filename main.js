// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Start your backend Express app
require(path.join(__dirname, 'BackEnd', 'mainApp.js'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,   // keep frontend like browser
      contextIsolation: true,   // safer
      sandbox: false,
      nativeWindowOpen: true,
      contextIsolation: true,
    }
  });

  // ipcMain.handle('get-graphics-path', async () => {
  //   const graphicsPath = app.isPackaged
  //     ? path.join(process.resourcesPath, 'graphics') 
  //     : path.join(__dirname, 'graphics'); 
  //   return graphicsPath;
  // });

  ipcMain.handle('get-graphics-path', async () => {
    const graphicsPath = app.isPackaged
      ? path.join(path.dirname(process.execPath), 'graphics') 
      : path.join(__dirname, 'graphics'); 
    return graphicsPath;
  });

  // Load your existing frontend
  // win.loadFile(path.join(__dirname, 'RetailApp.html'));
  win.loadFile(path.join(__dirname, 'LogIn.html'));
  win.maximize();

  // if (process.platform !== 'darwin') win.setMenu(null);
  
  // Optional: Open DevTools automatically
  if (process.env.NODE_ENV === 'development') win.webContents.openDevTools();

}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Listen for any new BrowserWindow created by window.open()
app.on('browser-window-created', (event, newWin) => {
  // wait until the window has loaded a URL so we can inspect it
  newWin.webContents.once('did-finish-load', () => {
    const url = newWin.webContents.getURL();
    if (url && url.includes('WinChat.html')) {
      newWin.setIcon(path.join(__dirname, 'favicon.ico'));
      // remove only the menu (keeps title bar and window controls)
      newWin.setMenu(null);
      // optional: maximize or resize
      newWin.maximize();
    }
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
