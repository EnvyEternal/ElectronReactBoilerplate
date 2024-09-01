const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadUrl: (url) => ipcRenderer.send('load-url', url),
  sendEventToElectron: (eventName, data) => ipcRenderer.send(eventName, data),
  loadHighlights: () => ipcRenderer.invoke('load-highlights'),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
