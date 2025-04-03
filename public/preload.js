const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectFiles: () => ipcRenderer.invoke('select-file'),
    selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
    getDroppedFilePaths: () => ipcRenderer.invoke('get-dropped-files'),
    processVideo: (data) => ipcRenderer.invoke('process-video', data),
    onConversionStart: (callback) => ipcRenderer.on('conversion-start', callback),
    onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', callback),
    removeConversionListeners: () => {
        ipcRenderer.removeAllListeners('conversion-start');
        ipcRenderer.removeAllListeners('conversion-progress');
    }
});
