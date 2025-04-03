const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

/**
 * Retrieves video information using ffprobe.
 * @param {string} filePath - Path to the video file.
 * @returns {Promise<object>} - An object containing width, height, duration, and size.
 */

function getVideoInfo(filePath) {
    return new Promise((resolve, reject) => {
        console.log('[videoUtils] DEBUG video path:', filePath);

        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }

            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

            if (!videoStream) {
                reject(new Error('No video stream found'));
                return;
            }

            const rawDuration = metadata.format.duration;
            console.log('[videoUtils] Raw duration:', rawDuration);
            const parsedDuration = rawDuration !== undefined ? Number(rawDuration) : null;
            console.log('[videoUtils] Parsed duration:', parsedDuration);

            resolve({
                width: videoStream.width,
                height: videoStream.height,
                duration: isNaN(parsedDuration) ? 1 : parsedDuration,
                size: metadata.format.size
            });
        });
    });
}

/**
 * Calculates new video dimensions to fit within target dimensions while preserving aspect ratio.
 * Ensures that both width and height are even numbers (required by libx264).
 * 
 * @param {number} originalWidth
 * @param {number} originalHeight
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @returns {object} - { width, height }
 */

function calculateDimensions(originalWidth, originalHeight, targetWidth, targetHeight) {
    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth <= targetWidth && originalHeight <= targetHeight) {
        return { width: originalWidth, height: originalHeight };
    }

    let width = targetWidth;
    let height = Math.round(width / aspectRatio);

    if (height > targetHeight) {
        height = targetHeight;
        width = Math.round(height * aspectRatio);
    }
    // Ensure dimensions are even numbers
    const even = (n) => (n % 2 === 0 ? n : n - 1);
    
    return { width: even(width), height: even(height) };
}

/**
 * Generates FFmpeg output options based on the target file size and video duration.
 * This ensures the output video fits under the 16MB WhatsApp limit.
 * 
 * @param {number} duration - Duration of the video in seconds.
 * @param {number} width
 * @param {number} height
 * @returns {string[]} - An array of FFmpeg output options.
 */

function getOutputOptions(duration, width, height) {
    const targetSizeMB = 16;
    const targetSizeBytes = targetSizeMB * 1024 * 1024;
    const safeDuration = Math.max(1, duration || 1);
    const bitrate = Math.floor((targetSizeBytes * 8) / safeDuration / 1000); // in kbps
    const clampedBitrate = Math.max(300, Math.min(bitrate, 6000));
    console.log('[videoUtils] Duration:', duration);

    const options = [
        '-c:v libx264',
        '-preset veryfast',
        `-b:v ${clampedBitrate}k`,
        '-c:a aac',
        '-b:a 128k',
        `-vf scale=${width}:${height}`
    ];
    console.log('[videoUtils] [OPTIONS]',options);
    return options;
}

/**
 * Converts the input video to a WhatsApp-compatible format.
 * Sends progress events via the provided mainWindow.
 * 
 * @param {string} inputPaths
 * @param {string} outputPath
 * @param {number} width
 * @param {number} height
 * @param {number} duration
 * @param {object} mainWindow - Electron BrowserWindow instance for sending IPC messages.
 * @returns {Promise<void>}
 */

function convertVideo(inputPath, outputPath, width, height, duration, mainWindow) {
    return new Promise((resolve, reject) =>{
        const outputOpts = getOutputOptions(duration, width, height);

        ffmpeg(inputPath)
        .addOption('-loglevel', 'verbose')
        .outputOptions(outputOpts)
        .format('mp4')
        .on('start', () => {
            mainWindow.webContents.send('conversion-start');
        })
        .on('progress', (progress) => {
            mainWindow.webContents.send('conversion-progress', progress.percent);
        })
        .on('stderr', (line) => {
            console.log('[videoUtils] [FFMPEG]', line);
        })
        .on('end', () => {
            resolve();
        })
        .on('error', (err) => {
            console.error('[videoUtils] [FFMPEG ERROR]', err.message);
            console.error('[videoUtils] [FFMPEG STACK]', err.stack);
            reject(new Error(`Conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
}

module.exports = {
    getVideoInfo,
    calculateDimensions,
    getOutputOptions,
    convertVideo
};
