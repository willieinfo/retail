const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getGraphicsPath: () => ipcRenderer.invoke('get-graphics-path')
});