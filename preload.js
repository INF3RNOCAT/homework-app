const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  resizeWindow: () => ipcRenderer.send("resize-window"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
});