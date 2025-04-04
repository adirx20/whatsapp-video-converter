const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const isDev = require('electron-is-dev');

// set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// import video utilities
const { getVideoInfo, calculateDimensions, getOutputOptions, convertVideo } = require('../src/utils/videoUtils');

// whatsapp video requirements
const WHATSAPP_MAX_SIZE = 16 * 1024 * 1024;     // 16MB
const WHATSAPP_VIDEO_WIDTH = 640;
const WHATSAPP_VIDEO_HEIGHT = 360;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// handle file selection
ipcMain.handle('select-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }
        ]
    });

    if (canceled) return null;
    return filePaths;
});

// handle output directory selection
ipcMain.handle('select-output-dir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (canceled) return null;
    return filePaths[0];
});

// handle dropped files
ipcMain.handle('get-dropped-files', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }
        ]
    });

    return result.canceled ? [] : result.filePaths;
});

// process video
ipcMain.handle('process-video', async (event, { inputPath, outputDir }) => {
    // Check if inputPath is an array to support batch conversion
    if (Array.isArray(inputPath)) {
        const results = [];
        for (const singlePath of inputPath) {
            const fileName = path.basename(singlePath, path.extname(singlePath));
            const outputPath = path.join(outputDir, `${fileName}_whatsapp.mp4`);

            console.log(`[PROCESS] input: ${singlePath}`);
            console.log(`[PROCESS] output: ${outputPath}`);

            try {
                // Get video info for this file
                const videoInfo = await getVideoInfo(singlePath);
                // Calculate dimensions while maintaining aspect ratio
                const { width, height } = calculateDimensions(videoInfo.width, videoInfo.height, WHATSAPP_VIDEO_WIDTH, WHATSAPP_VIDEO_HEIGHT);
                // convert the video
                await convertVideo(singlePath, outputPath, width, height, videoInfo.duration, mainWindow);
                results.push({ success: true, outputPath });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return results;
    } else {
        // Single file processing
        const fileName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${fileName}_whatsapp.mp4`);

        console.log('[PROCESS] input:', inputPath);
        console.log('[PROCESS] output:', outputPath);

        try {
            const videoInfo = await getVideoInfo(inputPath);
            const { width, height } = calculateDimensions(videoInfo.width, videoInfo.height, WHATSAPP_VIDEO_WIDTH, WHATSAPP_VIDEO_HEIGHT);
            await convertVideo(inputPath, outputPath, width, height, videoInfo.duration, mainWindow);
            return { success: true, outputPath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
});

// // get video information 
// function getVideoInfo(filePath) {
//     return new Promise((resolve, reject) => {
//         console.log('DEBUG video path:', filePath);
//         ffmpeg.ffprobe(filePath, (err, metadata) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

//             if (!videoStream) {
//                 reject(new Error('No video stream found'));
//                 return;
//             }

//             const rawDuration = metadata.format.duration;

//             console.log('[DEBUG] Raw duration:', rawDuration);

//             const parsedDuration = rawDuration !== undefined ? Number(rawDuration) : null;

//             console.log('[DEBUG] Parsed duration:', parsedDuration);

//             resolve({
//                 width: videoStream.width,
//                 height: videoStream.height,
//                 duration: isNaN(parsedDuration) ? 1 : parsedDuration,
//                 size: metadata.format.size
//             });
//         });
//     });
// }

// // calculate dimmensions while maintaining aspect ratio
// function calculateDimensions(originalWidth, originalHeight) {
//     const aspectRatio = originalWidth / originalHeight;

//     // if already smaller than target, keep original dimensions
//     if (originalWidth <= WHATSAPP_VIDEO_WIDTH && originalHeight <= WHATSAPP_VIDEO_HEIGHT) {
//         return { width: originalWidth, height: originalHeight };
//     }

//     // calculate based on aspect ratio
//     let width = WHATSAPP_VIDEO_WIDTH;
//     let height = Math.round(width / aspectRatio);

//     if (height > WHATSAPP_VIDEO_HEIGHT) {
//         height = WHATSAPP_VIDEO_HEIGHT;
//         width = Math.round(height * aspectRatio);
//     }

//     // return a number divisible by 2 (libx264 requirements)
//     const even = (n) => n % 2 === 0 ? n : n - 1;

//     return { width: even(width), height: even(height) };

// }

// // get output options
// function getOutputOptions(duration, width, height) {
//     const targetSizeMB = 16;
//     const targetSizeBytes = targetSizeMB * 1024 * 1024;
//     const safeDuration = Math.max(1, duration || 1);
//     const bitrate = Math.floor((targetSizeBytes * 8) / safeDuration / 1000);
//     const clampedBitrate = Math.max(300, Math.min(bitrate, 6000)); // stay in range

//     console.log('[DEBUG] Duration:', duration);

//     const options = [
//         '-c:v libx264',
//         '-preset veryfast',
//         `-b:v ${clampedBitrate}k`,
//         '-c:a aac',
//         '-b:a 128k',
//         `-vf scale=${width}:${height}`
//     ];

//     console.log('[OPTIONS]', options);
//     return options;
// }

// // convert video
// function convertVideo(inputPath, outputPath, width, height, duration) {
//     return new Promise((resolve, reject) => {

//         const outputOpts = getOutputOptions(duration, width, height);

//         ffmpeg(inputPath)
//             .addOption('-loglevel', 'verbose')
//             .outputOptions(outputOpts)
//             .format('mp4')
//             .on('start', () => {
//                 mainWindow.webContents.send('conversion-start');
//             })
//             .on('progress', (progress) => {
//                 mainWindow.webContents.send('conversion-progress', progress.percent);
//             })
//             .on('stderr', (line) => {
//                 console.log('[FFMPEG]', line);
//             })
//             .on('end', () => {
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('[FFMPEG ERROR]', err.message);
//                 console.error('[FFMPEG STACK]', err.stack);

//                 reject(new Error(`Conversion failed: ${err.message}`));
//             })
//             .save(outputPath);
//     });
// }
