const { contextBridge, ipcRenderer } = require('electron');

// expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    selectFiles: () => ipcRenderer.invoke('select-file'),
    selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
    processVideo: (data) => ipcRenderer.invoke('process-video', data),
    onConversionStart: (callback) => ipcRenderer.on('conversion-start', callback),
    onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', callback),
    removeConversionListeners: () => {
        ipcRenderer.removeAllListeners('conversion-start');
        ipcRenderer.removeAllListeners('conversion-progress');
    }
});
